import traceback
import sys
import bcrypt
print(bcrypt.__version__)
try:
    from auth import get_password_hash
    print(get_password_hash("testpwd123"))
except Exception as e:
    traceback.print_exc()
