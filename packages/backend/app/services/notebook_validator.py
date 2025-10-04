import json
import asyncio
import tempfile
import subprocess
import sys
from pathlib import Path
from typing import Dict, Any, List, Optional
from app.models.notebook import ModelInfo

class NotebookValidator:
    def __init__(self):
        self.temp_dir = tempfile.mkdtemp(prefix="alacard_validation_")

    def __del__(self):
        # Cleanup temporary directory
        import shutil
        if Path(self.temp_dir).exists():
            shutil.rmtree(self.temp_dir)

    async def validate_notebook(self, notebook_content: Dict[str, Any], model_id: str) -> Dict[str, Any]:
        """
        Validate that a generated notebook can execute successfully
        """
        validation_results = {
            "notebook_id": model_id,
            "validation_timestamp": "2024-01-01T00:00:00Z",
            "cells_validated": [],
            "syntax_errors": [],
            "runtime_errors": [],
            "model_loading_success": False,
            "overall_status": "failed"
        }

        try:
            # Save notebook to temporary file
            notebook_path = Path(self.temp_dir) / f"{model_id.replace('/', '_')}_test.ipynb"
            with open(notebook_path, 'w') as f:
                json.dump(notebook_content, f, indent=2)

            # Validate syntax and runtime
            results = await self._validate_notebook_cells(notebook_content, model_id)
            validation_results.update(results)

            # Overall status
            validation_results["overall_status"] = (
                "success" if (
                    len(validation_results["syntax_errors"]) == 0 and
                    len(validation_results["runtime_errors"]) == 0 and
                    validation_results["model_loading_success"]
                ) else "failed"
            )

        except Exception as e:
            validation_results["runtime_errors"].append({
                "cell_index": -1,
                "cell_type": "system",
                "error_type": "ValidationFramework",
                "error_message": str(e)
            })

        return validation_results

    async def _validate_notebook_cells(self, notebook_content: Dict[str, Any], model_id: str) -> Dict[str, Any]:
        """Validate individual cells in the notebook"""
        cells = notebook_content.get("cells", [])
        syntax_errors = []
        runtime_errors = []
        model_loading_success = False
        cells_validated = []

        # Track installed packages
        installed_packages = set()

        for i, cell in enumerate(cells):
            cell_result = {
                "cell_index": i,
                "cell_type": cell["cell_type"],
                "validation_status": "not_validated"
            }

            try:
                if cell["cell_type"] == "code":
                    # Validate syntax
                    syntax_result = await self._validate_syntax(cell["source"])
                    cell_result["syntax_valid"] = syntax_result["valid"]

                    if not syntax_result["valid"]:
                        syntax_errors.append({
                            "cell_index": i,
                            "cell_type": "code",
                            "error_type": "SyntaxError",
                            "error_message": syntax_result["error"],
                            "line_number": syntax_result.get("line", 0)
                        })
                        cell_result["validation_status"] = "syntax_error"
                    else:
                        # Try runtime execution
                        runtime_result = await self._execute_cell(
                            cell["source"],
                            i,
                            installed_packages,
                            model_id
                        )
                        cell_result.update(runtime_result)

                        if runtime_result["success"]:
                            # Check if this is the model loading cell
                            if self._is_model_loading_cell(cell["source"]):
                                model_loading_success = runtime_result.get("model_loaded", False)

                            # Add any new packages that were installed
                            if runtime_result.get("packages_installed"):
                                installed_packages.update(runtime_result["packages_installed"])

                            cell_result["validation_status"] = "runtime_success"
                        else:
                            runtime_errors.append({
                                "cell_index": i,
                                "cell_type": "code",
                                "error_type": runtime_result.get("error_type", "RuntimeError"),
                                "error_message": runtime_result.get("error_message", "Unknown error"),
                                "line_number": runtime_result.get("line_number", 0)
                            })
                            cell_result["validation_status"] = "runtime_error"

                elif cell["cell_type"] == "markdown":
                    # Markdown cells always pass validation
                    cell_result["validation_status"] = "validated"

                cells_validated.append(cell_result)

            except Exception as e:
                runtime_errors.append({
                    "cell_index": i,
                    "cell_type": cell["cell_type"],
                    "error_type": "ValidationError",
                    "error_message": str(e)
                })
                cell_result["validation_status"] = "validation_error"
                cells_validated.append(cell_result)

        return {
            "cells_validated": cells_validated,
            "syntax_errors": syntax_errors,
            "runtime_errors": runtime_errors,
            "model_loading_success": model_loading_success
        }

    async def _validate_syntax(self, source: List[str]) -> Dict[str, Any]:
        """Validate Python syntax of a code cell"""
        try:
            code = "\n".join(source)
            # Use Python's ast module to check syntax
            import ast
            ast.parse(code)
            return {"valid": True}
        except SyntaxError as e:
            return {
                "valid": False,
                "error": str(e),
                "line": e.lineno or 1
            }
        except Exception as e:
            return {
                "valid": False,
                "error": f"Syntax validation failed: {str(e)}",
                "line": 1
            }

    def _is_model_loading_cell(self, source: List[str]) -> bool:
        """Check if this cell contains model loading code"""
        source_text = "\n".join(source).lower()
        return any(keyword in source_text for keyword in [
            "pipeline(", "autotokenizer", "automodel", "from_pretrained", "pipeline("
        ])

    async def _execute_cell(self, source: List[str], cell_index: int,
                           installed_packages: set, model_id: str) -> Dict[str, Any]:
        """Execute a notebook cell and capture output"""
        try:
            code = "\n".join(source)

            # Write cell to temporary Python file
            cell_file = Path(self.temp_dir) / f"cell_{cell_index}.py"
            with open(cell_file, 'w') as f:
                f.write(code)

            # Execute the cell
            result = subprocess.run(
                [sys.executable, str(cell_file)],
                capture_output=True,
                text=True,
                timeout=30,  # 30 second timeout
                cwd=self.temp_dir
            )

            # Parse the output
            return_code = result.returncode
            stdout = result.stdout
            stderr = result.stderr

            if return_code == 0:
                # Check for model loading success
                success = "✅" in stdout or "model loaded successfully" in stdout.lower()

                # Check for package installations
                packages_installed = set()
                if "Successfully installed" in stdout:
                    # Extract package names from pip install output
                    import re
                    packages = re.findall(r'Successfully installed ([\w-]+)', stdout)
                    packages_installed.update(packages)

                return {
                    "success": True,
                    "output": stdout,
                    "model_loaded": success,
                    "packages_installed": packages_installed
                }
            else:
                return {
                    "success": False,
                    "output": stdout,
                    "error_message": stderr or stdout,
                    "error_type": "SubprocessError" if stderr else "RuntimeError",
                    "line_number": self._extract_line_number(stderr or stdout)
                }

        except subprocess.TimeoutExpired:
            return {
                "success": False,
                "error_message": "Cell execution timed out after 30 seconds",
                "error_type": "TimeoutError"
            }
        except Exception as e:
            return {
                "success": False,
                "error_message": str(e),
                "error_type": "ExecutionError"
            }

    def _extract_line_number(self, error_output: str) -> int:
        """Extract line number from error output"""
        import re
        match = re.search(r'line (\d+)', error_output)
        return int(match.group(1)) if match else 1

    async def validate_model_specifics(self, notebook_content: Dict[str, Any],
                                   model_info: ModelInfo) -> Dict[str, Any]:
        """Validate model-specific requirements"""
        validation = {
            "model_info_matches": True,
            "pipeline_compatible": True,
            "packages_installed": []
        }

        # Check if pipeline tag matches actual model capabilities
        cells = notebook_content.get("cells", [])
        for cell in cells:
            if cell["cell_type"] == "code":
                source = "\n".join(cell["source"])

                # Check if hello cell uses the right pipeline
                if self._is_model_loading_cell(source):
                    pipeline_used = self._extract_pipeline_from_code(source)
                    if pipeline_used and model_info.pipeline_tag:
                        if not self._is_compatible_pipeline(pipeline_used, model_info.pipeline_tag):
                            validation["pipeline_compatible"] = False

        return validation

    def _extract_pipeline_from_code(self, source: str) -> Optional[str]:
        """Extract pipeline type from code"""
        import re
        match = re.search(r"pipeline\('([^']+)'", source)
        return match.group(1) if match else None

    def _is_compatible_pipeline(self, used_pipeline: str, model_pipeline: str) -> bool:
        """Check if used pipeline is compatible with model's pipeline"""
        # Simple compatibility check - can be enhanced
        pipeline_mappings = {
            "text-generation": ["text-generation"],
            "text-classification": ["text-classification", "sentiment-analysis"],
            "summarization": ["summarization"],
            "translation": ["translation"],
            "feature-extraction": ["feature-extraction"],
            "fill-mask": ["fill-mask"],
        }

        model_category = pipeline_mappings.get(model_pipeline, [])
        return used_pipeline in model_category