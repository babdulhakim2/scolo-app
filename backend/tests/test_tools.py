from src.tools import adverse_media, business_registry, geo_risk, pep_check, sanctions


class TestSanctions:
    def test_known_sanctioned_person(self):
        result = sanctions.check("Vladimir Putin")
        assert result["status"] == "match"
        assert result["confidence"] == 100
        assert len(result["findings"]) > 0

    def test_clear_entity(self):
        result = sanctions.check("John Smith Random Person 12345")
        assert result["status"] == "clear"
        assert result["tool"] == "sanctions"

    def test_result_structure(self):
        result = sanctions.check("Test Entity")
        assert "id" in result
        assert "tool" in result
        assert "entity" in result
        assert "status" in result
        assert "confidence" in result
        assert "findings" in result
        assert "sources" in result


class TestPepCheck:
    def test_known_pep(self):
        result = pep_check.check("Joe Biden")
        assert result["status"] == "match"
        assert result["confidence"] == 100
        assert result["findings"][0]["position"] == "President of the United States"

    def test_clear_person(self):
        result = pep_check.check("Random Person Nobody")
        assert result["status"] == "clear"

    def test_result_structure(self):
        result = pep_check.check("Test Person")
        assert "id" in result
        assert "tool" in result
        assert result["tool"] == "pep_check"


class TestGeoRisk:
    def test_high_risk_country(self):
        result = geo_risk.check("Russia")
        assert result["status"] == "high"
        assert result["findings"][0]["fatf_status"] == "grey"

    def test_low_risk_country(self):
        result = geo_risk.check("US")
        assert result["status"] == "low"

    def test_critical_risk_country(self):
        result = geo_risk.check("North Korea")
        assert result["status"] == "critical"

    def test_unknown_country(self):
        result = geo_risk.check("Unknown Country XYZ")
        assert result["status"] == "unknown"


class TestAdverseMedia:
    def test_result_structure(self):
        result = adverse_media.check("Test Company")
        assert "id" in result
        assert "tool" in result
        assert result["tool"] == "adverse_media"
        assert "status" in result
        assert "findings" in result


class TestBusinessRegistry:
    def test_result_structure(self):
        result = business_registry.check("Test Company")
        assert "id" in result
        assert "tool" in result
        assert result["tool"] == "business_registry"
        assert "status" in result
