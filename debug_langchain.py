import sys
import os

try:
    import langchain
    print(f"LangChain version: {langchain.__version__}")
    print(f"LangChain path: {langchain.__file__}")
    print(f"LangChain dir: {dir(langchain)}")
except ImportError as e:
    print(f"Error importing langchain: {e}")

try:
    import langchain.chains
    print("langchain.chains imported successfully")
except ImportError as e:
    print(f"Error importing langchain.chains: {e}")

try:
    from langchain.chains.combine_documents import create_stuff_documents_chain
    print("create_stuff_documents_chain found")
except ImportError as e:
    print(f"Error importing create_stuff_documents_chain: {e}")
