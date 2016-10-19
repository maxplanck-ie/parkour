from django.conf.urls import url
from library import views


urlpatterns = [
    # Libraries
    url(r'^get_library_protocols/$', views.LibraryField.as_view(), name='get_library_protocols'),
    url(r'^get_library_type/$', views.LibraryField.as_view(), name='get_library_type'),
    url(r'^get_organisms/$', views.LibraryField.as_view(), name='get_organisms'),
    url(r'^get_index_types/$', views.LibraryField.as_view(), name='get_index_types'),
    url(r'^get_index_i7/$', views.LibraryField.as_view(), name='get_index_i7'),
    url(r'^get_index_i5/$', views.LibraryField.as_view(), name='get_index_i5'),
    url(r'^get_concentration_methods/$', views.LibraryField.as_view(), name='get_concentration_methods'),
    url(r'^get_sequencing_run_conditions/$', views.LibraryField.as_view(), name='get_sequencing_run_conditions'),
    url(r'^get_libraries/$', views.LibraryView.as_view(), name='get_libraries'),
    url(r'^save_library/$', views.LibraryView.as_view(), name='save_library'),
    url(r'^delete_library/$', views.LibraryView.as_view(), name='delete_library'),
    url(r'^upload_file_library/$', views.upload_file_library, name='upload_file_library'),
    url(r'^get_file_library/$', views.get_file_library, name='get_file_library'),

    # Samples
    url(r'^get_nucleic_acid_types/$', views.SampleField.as_view(), name='get_nucleic_acid_types'),
    url(r'^get_sample_protocols/$', views.SampleField.as_view(), name='get_sample_protocols'),
    url(r'^get_rna_qualities/$', views.SampleField.as_view(), name='get_rna_qualities'),
    url(r'^save_sample/$', views.SampleView.as_view(), name='save_sample'),
    url(r'^delete_sample/$', views.SampleView.as_view(), name='delete_sample'),
    url(r'^upload_file_sample/$', views.upload_file_sample, name='upload_file_sample'),
    url(r'^get_file_sample/$', views.get_file_sample, name='get_file_sample'),

    # Upload from File
    url(r'^load_records_from_file/$', views.load_records_from_file, name='load_records_from_file'),
    url(r'^generate_template/$', views.generate_template, name='generate_template'),
]
