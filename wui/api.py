from rest_framework import routers

from request.views import RequestViewSet
from library_sample_shared.views import (OrganismViewSet, IndexTypeViewSet,
                                         LibraryProtocolViewSet, IndexViewSet,
                                         LibraryTypeViewSet)
from library.views import LibrarySampleListViewSet, LibraryViewSet
from sample.views import SampleViewSet


router = routers.DefaultRouter()
router.register(r'requests', RequestViewSet, base_name='request')
router.register(r'organisms', OrganismViewSet, base_name='organism')
router.register(r'index_types', IndexTypeViewSet, base_name='index-type')
router.register(r'indices', IndexViewSet, base_name='index')
router.register(r'library_protocols', LibraryProtocolViewSet, base_name='library-protocol')
router.register(r'library_types', LibraryTypeViewSet, base_name='library-type')
router.register(r'libraries_and_samples', LibrarySampleListViewSet, base_name='libraries-and-samples')
router.register(r'libraries', LibraryViewSet, base_name='libraries')
router.register(r'samples', SampleViewSet, base_name='samples')
