from django.conf.urls import url
from library.views import LibraryField, LibraryView, SampleField, SampleView, \
    upload_file_library, get_file_library, upload_file_sample, \
    get_file_sample


urlpatterns = [
    # Libraries
    url(r'^get_library_protocols/$', LibraryField.as_view(), name='get_library_protocols'),
    url(r'^get_library_type/$', LibraryField.as_view(), name='get_library_type'),
    url(r'^get_organisms/$', LibraryField.as_view(), name='get_organisms'),
    url(r'^get_index_types/$', LibraryField.as_view(), name='get_index_types'),
    url(r'^get_index_i7/$', LibraryField.as_view(), name='get_index_i7'),
    url(r'^get_index_i5/$', LibraryField.as_view(), name='get_index_i5'),
    url(r'^get_concentration_methods/$', LibraryField.as_view(), name='get_concentration_methods'),
    url(r'^get_sequencing_run_conditions/$', LibraryField.as_view(), name='get_sequencing_run_conditions'),

    url(r'^get_libraries/$', LibraryView.as_view(), name='get_libraries'),
    url(r'^save_library/$', LibraryView.as_view(), name='save_library'),
    url(r'^delete_library/$', LibraryView.as_view(), name='delete_library'),
    url(r'^upload_file_library/$', upload_file_library, name='upload_file_library'),
    url(r'^get_file_library/$', get_file_library, name='get_file_library'),

    # Samples
    url(r'^get_nucleic_acid_types/$', SampleField.as_view(), name='get_nucleic_acid_types'),
    url(r'^get_sample_protocols/$', SampleField.as_view(), name='get_sample_protocols'),
    url(r'^get_rna_qualities/$', SampleField.as_view(), name='get_rna_qualities'),

    url(r'^save_sample/$', SampleView.as_view(), name='save_sample'),
    url(r'^delete_sample/$', SampleView.as_view(), name='delete_sample'),
    url(r'^upload_file_sample/$', upload_file_sample, name='upload_file_sample'),
    url(r'^get_file_sample/$', get_file_sample, name='get_file_sample'),
]
