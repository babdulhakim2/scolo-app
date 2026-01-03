import os

from cuid2 import cuid_wrapper

try:
    import weave
    if os.getenv("WEAVE_PROJECT"):
        weave.init(os.getenv("WEAVE_PROJECT"))
        WEAVE_ENABLED = True
    else:
        WEAVE_ENABLED = False
except ImportError:
    WEAVE_ENABLED = False
    weave = None

cuid = cuid_wrapper()


def weave_op(func):
    """Decorator that applies weave.op() if Weave is enabled."""
    if WEAVE_ENABLED and weave:
        return weave.op()(func)
    return func


from . import adverse_media, business_registry, geo_risk, pep_check, sanctions

TOOLS = {
    "sanctions": sanctions.check,
    "adverse_media": adverse_media.check,
    "business_registry": business_registry.check,
    "pep_check": pep_check.check,
    "geo_risk": geo_risk.check,
}

__all__ = ["TOOLS", "sanctions", "adverse_media", "business_registry", "pep_check", "geo_risk"]
