"""SQLAlchemy 2.0 Declarative Models Package (`db.models`).

Provides automatic discovery and importing of all model modules in this package
to ensure `Base.metadata` contains all table schemas when Alembic generates migrations.
"""

import pkgutil
from importlib import import_module
from pathlib import Path

# Auto-discover and import all model modules in this package
_pkg_path = Path(__file__).parent
for _, _module_name, _ in pkgutil.iter_modules([str(_pkg_path)]):
    if not _module_name.startswith("_"):
        import_module(f"{__name__}.{_module_name}")
