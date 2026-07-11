import os
import re

files = [
    "COLLABORATION_PLAN.md",
    "PADO_ARCHITECTURE_GUIDE.md",
    "PADO_Full_Technical_Spec.md",
    "PHASE_2_BACKEND_GUIDE.md",
    "VERIFICATION_GUIDE.md"
]

for file in files:
    if not os.path.exists(file):
        continue
    with open(file, 'r') as f:
        content = f.read()

    # Replacements
    content = re.sub(r'(?i)local llms?', 'hyperparametered local LLM', content)
    content = re.sub(r'(?i)hyperparametered\s+hyperparametered', 'hyperparametered', content)

    content = re.sub(r'XGBoost ML model', 'hyperparametered XGBoost ML model', content)
    content = re.sub(r'XGBoost model', 'hyperparametered XGBoost model', content)
    content = re.sub(r'trained Machine Learning model', 'hyperparametered XGBoost ML model', content)
    content = re.sub(r'trained XGBoost ML model', 'hyperparametered XGBoost ML model', content)
    content = re.sub(r'trained XGBoost model', 'hyperparametered XGBoost model', content)

    content = re.sub(r'(?i)hyperparametered\s+hyperparametered', 'hyperparametered', content)
    content = re.sub(r'trained hyperparametered', 'hyperparametered', content)

    with open(file, 'w') as f:
        f.write(content)

print("Replacements complete.")
