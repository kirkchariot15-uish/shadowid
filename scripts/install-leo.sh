#!/bin/bash

echo "Installing Leo CLI..."

# Install Leo
curl -L https://raw.githubusercontent.com/AleoHQ/aleo/main/install.sh | sh

# Add to PATH
export PATH=$PATH:$HOME/.aleo/bin

# Verify installation
leo --version

echo "Leo CLI installation complete!"
