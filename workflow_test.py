#!/usr/bin/env python3
"""
Comprehensive Workflow Test Script for Alacard Notebook Generation

This script tests the complete notebook generation workflow:
1. API Endpoint Validation
2. Task Creation
3. Background Processing
4. Progress Tracking
5. Error Handling
6. Status Retrieval

Usage: python3 workflow_test.py
"""

import requests
import json
import time
import sys
import subprocess
import signal
import os
from typing import Dict, Any, Optional
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configuration
BASE_URL = os.getenv("NEXT_PUBLIC_BACKEND_URL", "https://alacard.onrender.com")
API_BASE = f"{BASE_URL}/api/v1/notebooks"

# Colors for output
class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    PURPLE = '\033[95m'
    CYAN = '\033[96m'
    WHITE = '\033[97m'
    ENDC = '\033[0m'

def print_status(status: str, message: str, color: str = None):
    """Print colored status message"""
    if color:
        print(f"{color}{status}: {message}{Colors.ENDC}")
    else:
        print(f"{status}: {message}")

def print_test_result(test_name: str, passed: bool, details: str = ""):
    """Print test result"""
    status = "✅ PASS" if passed else "❌ FAIL"
    color = Colors.GREEN if passed else Colors.RED
    print(f"{color}{status}{Colors.ENDC} {test_name}")
    if details:
        print(f"   {details}")

class WorkflowTester:
    def __init__(self):
        self.session = requests.Session()
        self.session.timeout = 30
        self.test_results = []
        self.task_id = None

    def check_services_running(self) -> bool:
        """Check if required services are running"""
        print_status("CHECK", "Testing service availability", Colors.BLUE)

        # Check FastAPI
        try:
            response = self.session.get(f"{BASE_URL}/docs")
            if response.status_code == 200:
                print_test_result("FastAPI Service", True, "API documentation accessible")
            else:
                print_test_result("FastAPI Service", False, f"Status code: {response.status_code}")
                return False
        except requests.exceptions.RequestException as e:
            print_test_result("FastAPI Service", False, f"Connection error: {e}")
            return False

        return True

    def test_api_validation(self) -> bool:
        """Test API validation"""
        print_status("TEST", "API Endpoint Validation", Colors.BLUE)

        # Test invalid request (missing required field)
        try:
            response = self.session.post(
                f"{API_BASE}/generate",
                json={"test": "invalid"},
                headers={"Content-Type": "application/json"}
            )
            if response.status_code == 422:
                print_test_result("Request Validation", True, "Properly validates required fields")
            else:
                print_test_result("Request Validation", False, f"Expected 422, got {response.status_code}")
                return False
        except Exception as e:
            print_test_result("Request Validation", False, f"Exception: {e}")
            return False

        return True

    def test_task_creation(self, model_id: str) -> Optional[str]:
        """Test task creation"""
        print_status("TEST", f"Creating task for model: {model_id}", Colors.BLUE)

        try:
            response = self.session.post(
                f"{API_BASE}/generate",
                json={"hf_model_id": model_id},
                headers={"Content-Type": "application/json"}
            )

            if response.status_code == 200:
                data = response.json()
                task_id = data.get("task_id")
                estimated_time = data.get("estimated_time")

                if task_id and estimated_time:
                    print_test_result("Task Creation", True, f"Task ID: {task_id}, Est. Time: {estimated_time}s")
                    self.task_id = task_id
                    return task_id
                else:
                    print_test_result("Task Creation", False, "Missing task_id or estimated_time in response")
                    return None
            else:
                print_test_result("Task Creation", False, f"Status code: {response.status_code}")
                return None

        except Exception as e:
            print_test_result("Task Creation", False, f"Exception: {e}")
            return None

    def test_task_status(self, task_id: str, expected_statuses: list = None) -> Dict[str, Any]:
        """Test task status retrieval"""
        print_status("TEST", f"Checking task status: {task_id[:8]}...", Colors.BLUE)

        try:
            response = self.session.get(f"{API_BASE}/task/{task_id}")

            if response.status_code == 200:
                data = response.json()
                status = data.get("status")

                if expected_statuses and status not in expected_statuses:
                    print_test_result("Task Status", False, f"Expected one of {expected_statuses}, got '{status}'")
                    return data

                print_test_result("Task Status Retrieval", True, f"Status: {status}, Progress: {data.get('progress', 0)}%")
                return data
            else:
                print_test_result("Task Status Retrieval", False, f"Status code: {response.status_code}")
                return {}

        except Exception as e:
            print_test_result("Task Status Retrieval", False, f"Exception: {e}")
            return {}

    def test_background_processing(self, task_id: str, timeout: int = 60) -> Dict[str, Any]:
        """Test background processing with timeout"""
        print_status("TEST", f"Monitoring background processing (timeout: {timeout}s)", Colors.BLUE)

        start_time = time.time()
        final_status = {}

        while time.time() - start_time < timeout:
            status_data = self.test_task_status(task_id)
            if not status_data:
                time.sleep(2)
                continue

            final_status = status_data
            status = status_data.get("status")

            if status in ["completed", "failed"]:
                print_status("COMPLETE", f"Task finished with status: {status}", Colors.GREEN if status == "completed" else Colors.RED)
                break

            time.sleep(3)  # Poll every 3 seconds

        elapsed = time.time() - start_time
        print_status("TIME", f"Total monitoring time: {elapsed:.1f}s", Colors.PURPLE)

        return final_status

    def test_error_handling(self) -> bool:
        """Test error handling"""
        print_status("TEST", "Testing Error Handling", Colors.BLUE)

        # Test with non-existent model
        task_id = self.test_task_creation("non-existent-model-12345")
        if not task_id:
            return False

        time.sleep(2)  # Let background task process
        status_data = self.test_task_status(task_id)

        if status_data.get("status") == "failed":
            error = status_data.get("error")
            if "not found" in str(error).lower():
                print_test_result("Error Handling", True, f"Properly handles model not found: {error}")
                return True
            else:
                print_test_result("Error Handling", False, f"Unexpected error: {error}")
                return False
        else:
            print_test_result("Error Handling", False, f"Expected 'failed' status, got '{status_data.get('status')}'")
            return False

    def validate_model_exists(self, model_id: str) -> bool:
        """Validate that a HuggingFace model exists before testing"""
        print_status("CHECK", f"Validating model exists: {model_id}", Colors.BLUE)

        try:
            # Simple HuggingFace API call to check if model exists
            response = self.session.get(f"https://huggingface.co/api/models/{model_id}", timeout=10)

            if response.status_code == 200:
                model_data = response.json()
                model_name = model_data.get("modelId", model_id)
                print_test_result("Model Validation", True, f"Model found: {model_name}")
                return True
            elif response.status_code == 404:
                print_test_result("Model Validation", False, f"Model not found: {model_id}")
                return False
            else:
                print_test_result("Model Validation", False, f"Unexpected status checking model: {response.status_code}")
                return False

        except requests.exceptions.Timeout:
            print_test_result("Model Validation", False, f"Timeout checking model: {model_id}")
            return False
        except requests.exceptions.RequestException as e:
            print_test_result("Model Validation", False, f"Network error checking model: {e}")
            return False

    def test_success_workflow(self) -> bool:
        """Test successful notebook generation workflow"""
        print_status("TEST", "Testing Successful Notebook Generation", Colors.BLUE)

        # Prompt user for model input with a default suggestion
        default_model = "openai-community/gpt2"
        user_input = input(f"Enter HuggingFace model ID to test (default: {default_model}): ").strip()
        test_model = user_input if user_input else default_model

        print_status("MODEL", f"Testing with model: {test_model}", Colors.CYAN)

        # Step 0: Validate model exists
        if not self.validate_model_exists(test_model):
            print_test_result("Success Workflow", False, f"Model validation failed: {test_model} does not exist or is inaccessible")
            return False

        # Step 1: Create task
        task_id = self.test_task_creation(test_model)
        if not task_id:
            return False

        # Step 2: Monitor full workflow
        print_status("TEST", f"Monitoring full workflow for {test_model}", Colors.BLUE)
        final_status = self.test_background_processing(task_id, timeout=120)  # 2 minute timeout

        if not final_status:
            print_test_result("Success Workflow", False, "Background processing failed or timed out")
            return False

        # Step 3: Validate successful completion
        status = final_status.get("status")
        if status != "completed":
            print_test_result("Success Workflow", False, f"Expected 'completed', got '{status}'")
            if final_status.get("error"):
                print(f"   Error: {final_status.get('error')}")
            return False

        # Step 4: Verify all expected fields are present
        required_fields = ["share_id"]
        missing_fields = [field for field in required_fields if field not in final_status]

        if missing_fields:
            print_test_result("Success Workflow", False, f"Missing required fields: {missing_fields}")
            return False

        # Step 5: Test notebook retrieval
        share_id = final_status.get("share_id")
        if not self.test_notebook_retrieval(share_id):
            return False

        # Step 6: Test validation results
        validation_summary = final_status.get("validation_summary", {})
        if validation_summary and validation_summary.get("overall_status") != "success":
            print_test_result("Success Workflow", False, f"Validation failed: {validation_summary}")
            return False

        validated_cells = validation_summary.get("cells_validated", 0) if validation_summary else 0
        print_test_result("Success Workflow", True,
                        f"Notebook generated successfully with {validated_cells} validated cells, Share ID: {share_id}")
        return True

    def test_notebook_retrieval(self, share_id: str) -> bool:
        """Test notebook retrieval by share ID"""
        print_status("TEST", f"Testing notebook retrieval: {share_id}", Colors.BLUE)

        try:
            response = self.session.get(f"{API_BASE}/{share_id}")

            if response.status_code == 200:
                data = response.json()
                required_fields = ["id", "share_id", "hf_model_id", "notebook_content", "metadata"]
                missing_fields = [field for field in required_fields if field not in data]

                if missing_fields:
                    print_test_result("Notebook Retrieval", False, f"Missing fields: {missing_fields}")
                    return False

                print_test_result("Notebook Retrieval", True, f"Retrieved notebook with {len(data.get('notebook_content', []))} cells")
                return True
            else:
                print_test_result("Notebook Retrieval", False, f"Status code: {response.status_code}")
                return False

        except Exception as e:
            print_test_result("Notebook Retrieval", False, f"Exception: {e}")
            return False

    def run_all_tests(self):
        """Run all workflow tests"""
        print_status("START", "Starting Alacard Workflow Test", Colors.CYAN)
        print("=" * 50)

        # Check if services are running
        if not self.check_services_running():
            print_status("FAIL", "Services are not running. Please run: bash start.sh", Colors.RED)
            return False

        # Run tests
        tests = [
            ("API Validation", self.test_api_validation),
            ("Error Handling", self.test_error_handling),
            ("Success Workflow", self.test_success_workflow),
        ]

        for test_name, test_func in tests:
            passed = test_func()
            self.test_results.append((test_name, passed))

            if not passed:
                print_status("STOP", f"Test failed: {test_name}", Colors.RED)
                print("=" * 50)
                self.print_summary()
                return False

        print("=" * 50)
        return True

    def print_summary(self):
        """Print test summary"""
        total_tests = len(self.test_results)
        passed_tests = sum(1 for _, passed in self.test_results if passed)
        failed_tests = total_tests - passed_tests

        print_status("SUMMARY", f"Tests: {passed_tests}/{total_tests} passed", Colors.CYAN)

        for test_name, passed in self.test_results:
            status = "✅" if passed else "❌"
            color = Colors.GREEN if passed else Colors.RED
            print(f"{color}{status}{Colors.ENDC} {test_name}")

        if failed_tests == 0:
            print_status("SUCCESS", "All tests passed! 🎉", Colors.GREEN)
        else:
            print_status("FAILED", f"{failed_tests} test(s) failed", Colors.RED)

def signal_handler(signum, frame):
    """Handle Ctrl+C gracefully"""
    print_status("STOP", "Test interrupted by user", Colors.YELLOW)
    sys.exit(0)

def main():
    """Main test runner"""
    # Set up signal handler for graceful shutdown
    signal.signal(signal.SIGINT, signal_handler)

    tester = WorkflowTester()

    # Run tests
    if tester.run_all_tests():
        sys.exit(0)
    else:
        sys.exit(1)

if __name__ == "__main__":
    main()