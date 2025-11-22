import os

base_dir = r"C:/Users/NEW USER/Project/cosmopolitanedu/staff/src/component/assessments"

# Let me directly update just the first file as a test
file1_path = os.path.join(base_dir, "assessment/ca-settings/ca-settings.jsx")
print(f"Writing to: {file1_path}")
print(f"File exists: {os.path.exists(file1_path)}")
