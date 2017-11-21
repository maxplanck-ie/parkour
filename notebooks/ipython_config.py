import os
import sys

FILE_PATH = os.path.abspath(os.path.dirname(__file__))
BASE_DIR = os.path.abspath(os.path.join(FILE_PATH, '..'))

# Allows the kernel to "see" the project during initialization. This
# FILE_PATH corresponds to Jupyter's "notebook-dir", but we want notebooks to
# behave as though they resided in the base directory to allow for clean
# imports.
# print('sys.path BEFORE = {}'.format(sys.path))
sys.path.insert(1, BASE_DIR)
# print('sys.path AFTER = {}'.format(sys.path))
