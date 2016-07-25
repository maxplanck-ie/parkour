from django.test import TestCase
from researcher.models import Organization, PrincipalInvestigator, CostUnit, Researcher


class ModelTestCases(TestCase):
    def setUp(self):
        self.organization = Organization.objects.create()
        self.pi = PrincipalInvestigator.objects.create(organization=self.organization)
        self.cost_unit = CostUnit.objects.create(pi=self.pi)
        self.researcher = Researcher.objects.create(organization=self.organization, pi=self.pi)

    def test_organization(self):
        self.assertEqual(str(self.organization), self.organization.name)

    def test_principal_investigator(self):
        self.assertEqual(str(self.pi), '%s (%s)' % (self.pi.name, self.pi.organization.name))

    def test_cost_unit(self):
        self.assertEqual(str(self.cost_unit), '%s (%s: %s)' % (self.cost_unit.name, self.cost_unit.pi.organization.name,
                                                               self.cost_unit.pi.name))

    def test_researcher(self):
        self.assertEqual(str(self.researcher), '%s %s (%s)' % (self.researcher.first_name, self.researcher.last_name,
                                                               self.researcher.organization))
