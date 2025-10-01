# open-uchile-theme
Open UChile MOOCs theme for  OpenedX. This theme must be used as open-uchile-theme in OpenedX

# Set OG Variables
- Enter location `/admin/site_configuration/siteconfiguration/`
    * In subdomain lms you must add the next two variables:
        * EOL_OG_SITE_NAME is use to determine the site name on Open Graph on index
        ```
        "EOL_OG_SITE_NAME":"open Uchile"
        ```
        * EOL_OG_SITE_DESCRIPTION is use to describe the site name on Open Graph on index
        ```
        "EOL_OG_SITE_DESCRIPTION":"Somos la plataforma de educación online de la Universidad de Chile. Nuestro objetivo es ofrecer programas de alta calidad académica que combinen el prestigio de nuestra universidad con la flexibilidad del aprendizaje digital.""
        ```

# Set social network Variables in footer
- Enter location `/admin/site_configuration/siteconfiguration/`
    * In subdomain lms you must add the next two variables:
        * FOOTER_URL is use to contain instagram, youtube and linkedin url. It is not mandatory for all variables to be present. 
        ```
        "FOOTER_URL":{"instagram":"https://www.instagram.com/vti_uchile/","youtube":"https://www.youtube.com/@educaciononlineuniversidad8305","linkedin":"https://www.linkedin.com/company/open-uchile/posts/"}
        ```

# Set show filter courses by year
- Enter location `/admin/site_configuration/siteconfiguration/`
    * In subdomain lms you must add the next two variables:
        * USE_YEAR_FILTER is use to show or not the year filter in explorer courses view.
        ```
        "USE_YEAR_FILTER":"True"
        ```

### Creating translation catalogues:

Create this folder structure in your theme folder: your-theme-folder/conf/locale.

Inside the locale folder, create a new file called: babel.cfg and copy the contents of open-uchile-theme/conf/locale/babel.cfg to this file. You can edit this file according to the requirements of your theme.

Then go to the Makefile in the root path of the project and find lang_targets variable, this is a list of the languages you want to enable in your theme; These languages must be in ISO code: https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes

Finally run: *make create_translations_catalogs*, this command will extract all the strings from your templates and create the django.po and djangojs.po files that contain the strings to translated.

### Configuring edx-platform:

For edx-platform to know the translation catalogue in your theme, you need to configure COMPREHENSIVE_THEME_LOCALE_PATHS, this is a list containing the path of the translation catalogues in your theme e.g. /openedx/themes/open-uchile-theme/conf/locale. This path must be the container or server path.

Add Released languages in the model DarkLang (/admin/dark_lang/darklangconfig/) e.g en,es-419

### Translating catalogues and compiling files:

Depending on the languages you have enabled you can add the custom translations directly to the django.po and djangojs.po files. When all the strings are manually translated, run: *make compile_translations* to create the django.mo and djangojs.mo files. These are the compiled files used in edx-platform.

### Commands

**Install**

    docker run -it --rm -w /code -v $(pwd):/code python:3.8 bash
    pip install -r requirements.in
    make create_translations_catalogs
    add your translation in .po files

**Compile**

    docker run -it --rm -w /code -v $(pwd):/code python:3.8 bash
    pip install -r requirements.in
    make compile_translations

**Update**

    docker run -it --rm -w /code -v $(pwd):/code python:3.8 bash
    pip install -r requirements.in
    make update_translations

**lms & cms .yml**

    COMPREHENSIVE_THEME_LOCALE_PATHS:
    - /openedx/themes/open-uchile-theme/conf/locale

### Note

- Translations only work with django.po
- Make translation with django html and mako html does not work
- Translation for this theme only translate mako, javascript and underscore

### TO-DO:

[ ] Course About: Video intro
[ ] Course About: Template
[ ] Main Django
[ ] FAQs content
[x] About content
[ ] Terms of Service and Honor Code
[ ] Privacy Policy
