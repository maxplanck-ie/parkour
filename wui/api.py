from rest_framework import routers

from request.views import RequestViewSet
from library_sample_shared.views import (OrganismViewSet, IndexTypeViewSet,
                                         LibraryProtocolViewSet,
                                         LibraryTypeViewSet)


router = routers.DefaultRouter()
router.register(r'requests', RequestViewSet, base_name='request')
router.register(r'organisms', OrganismViewSet, base_name='organism')
router.register(r'index_types', IndexTypeViewSet, base_name='index_type')
router.register(r'library_protocols', LibraryProtocolViewSet, base_name='library_protocol')
router.register(r'library_types', LibraryTypeViewSet, base_name='library_type')
