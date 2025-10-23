var now = new Date();
var current_page = 1;
var total_pages = 20;
var page_size = 20;
var filters = {
    "search_string": "",
    "order_by": "newer",
    "year": "",
    "state": "",
    "classification": "",
    "category": "",
    "current_page": 1
}
var $pagination = $('#pagination-explorer');

var defaultOpts = {
    totalPages: total_pages,
    first: '<<',
    prev: '<',
    next: '>',
    last: '>>',
    visiblePages: 5
}

function createSelectOptions(container, objectList, facet, translate_text) {
    const select = $('<select>')
        .addClass('form-select mb-4')
        .attr({
            'data-facet': facet,
            'id':facet+'-select'
        })
        .appendTo(container);

    $('<option>')
        .attr('value', '')
        .text(translate_text)
        .appendTo(select);

    objectList.forEach(object => {
        $('<option>')
            .attr({
                'value': object.id,
                'data-value': object.id,
                'data-text': object.name
            })
            .text(object.name)
            .appendTo(select);
    });
}

function loadOrganizations() {
    $.get("/course_classification/get_main_classifications")
        .done(function(data) {
            const container = $("#organizations");
            container.empty();
            createSelectOptions(container, data, 'classification', gettext('Select an organization'));
        })
        .fail(function() {
            console.error(gettext('ERROR loading organizations'));
        });
}

function loadCategories() {
    $.get("/course_classification/get_course_categories")
        .done(function(data) {
            const container = $("#categories");
            container.empty();
            createSelectOptions(container, data, 'category',  gettext('Select a category'))
        })
        .fail(function() {
            console.error(gettext('ERROR loading categories'));
        });
}

$(document).ready(function() {
    loadOrganizations();
    loadCategories();
    clearFilter();
});

$(window).on('load',function() {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    // get different types of url params
    if (urlParams.has('search_string')){ 
        filters["search_string"]=urlParams.get('search_string')
        $("#discovery-input").val(urlParams.get('search_string'))
    }
    if (urlParams.has('order')){ 
        filters["order"]=urlParams.get('order')
        $("#order-select").val(urlParams.get('order'))
    }
    if (urlParams.has('year')){ 
        filters["year"]=urlParams.get('year')
        $("#year-select").val(urlParams.get('year'))
    }
    if (urlParams.has('state')){ 
        filters["state"]=urlParams.get('state')
        $("#state-select").val(urlParams.get('state'))
    }
    if (urlParams.has('organization')){ 
        const selectedOrganization = urlParams.get('organization');
        filters["classification"] = selectedOrganization;
        $("#classification-select").val(urlParams.get('classification'))
    }
    if (urlParams.has('category')){ 
        const selectedCategory = urlParams.get('category');
        filters["category"] = selectedCategory;
        $("#category-select").val(urlParams.get('category'))
    }
    initDiscovery();
});
function initDiscovery(){
    getData().then(function() {
        createPagination();
    });
}

function createPagination(){
    var $pagination = $('#pagination-explorer');
    $pagination.twbsPagination('destroy');
    if (total_pages !== 0){
        $pagination.twbsPagination($.extend({}, defaultOpts, {
        startPage: current_page,
        totalPages: total_pages,
        initiateStartPageClick:false,
        onPageClick: function (event, page) {
            filters["current_page"] = page
            current_page = page;
            cleanCourses();
            getData();
        }
        }));
    }
}

function getData(){
    $("#loadingCircles").css("display","block");
    $("#list-courses").css("display","none");
    return $.post( "/course_classification/search/", filters )
    .done(function( data ) {
        if (data.error == undefined) {
            const container = document.getElementById("list-courses");
            if (data.results.length == 0){
                const courseHtml = edx.HtmlUtils.HTML( '<div class="text-center font-italic" id="empty-courses-message"><p>'+gettext("No results were found for your search")+'.</p><img id="empty-courses-image" src="static/open-uchile-theme/images/svg-2023/empty_courses.svg"></div>')
                row = document.createElement('div');
                row.className = 'row d-flex justify-content-center';
                container.appendChild(row);
                edx.HtmlUtils.append(row, courseHtml);
            } 
            if (data.results.length != 1){
                for (let i = 0; i < data.results.length -1; i += 2) {
                    const courseHtml = createCourse(data.results[i], data.results[i].extra_data);
                    const courseHtml2 = createCourse(data.results[i+1], data.results[i+1].extra_data);
                    if (element_added % 2 === 0) {
                        row = document.createElement('div');
                        row.className = 'row d-flex justify-content-center w-100';
                        container.appendChild(row);
                    }
                    element_added = element_added + 1
                    edx.HtmlUtils.append(row, courseHtml);
                    edx.HtmlUtils.append(row, courseHtml2);
                }
            }
            if (data.results.length % 2 !== 0){
                const courseHtml = createCourse(data.results[data.results.length - 1], data.results[data.results.length - 1].extra_data);
                const courseHtml2 = edx.HtmlUtils.HTML('<div class="col-xl-4 col-lg-10 col-md-12 col-sm-12 mb-3 mx-3 p-2"></div>')
                row = document.createElement('div');
                row.className = 'row d-flex justify-content-center w-100';
                container.appendChild(row);
                edx.HtmlUtils.append(row, courseHtml);
                edx.HtmlUtils.append(row, courseHtml2);
            }
            $("#loadingCircles").css("display","none");
            $("#list-courses").css("display","block");
        }else{
            console.log("ERROR:" + data.error)
        }
        $(".open-filter-bar #discovery-message").text(gettext("Showing") + " " + data.results.length  + " " + gettext("courses out of") + " " + data.total);
        page_size = data.page_size;
        total_pages = Math.ceil(data.total/page_size);
    })
}

$(document).on('click', '#advance-button', function(e) {
    const $div_filter = $('#filter-bar');
    const $div_courses = $('#section-courses');

    if ($div_filter.css('display') === 'none' || $div_filter.css('display') === '') {
        $div_filter.css('display', 'block');
        $div_filter.addClass("col-md-3");
        $div_courses.removeClass("col-md-12");
        $div_courses.addClass("col-md-9");
    } else {
        $div_filter.css('display', 'none');
        $div_filter.removeClass("col-md-3");
        $div_courses.removeClass("col-md-9");
        $div_courses.addClass("col-md-12");
    }
});

$(document).on('change', '[data-facet="category"], [data-facet="classification"]', function() {
    let facet = $(this).data("facet");
    filters[facet] = gettext($(this)[0].value);
    filters["current_page"] = 1;
    current_page = 1;
    let list_course1 = getCourses();
    // executes when promise is resolved successfully
    list_course1.then(
        function successValue(result) {
            console.log(result);
        },
    )
    // executes if there is an error
    .catch(
        function errorValue(result) {
            console.log(result);
        }
    );
});

$('#state-select, #year-select, #order-select').on('change', function(e) {
    e.preventDefault();
    let facet = $(this).data("facet");
    filters[facet] = gettext($(this)[0].value);
    filters["current_page"] = 1;
    current_page = 1;

    let list_course1 = getCourses();
    // executes when promise is resolved successfully
    list_course1.then(
        function successValue(result) {
            // console.log(result);
        },
    )
    .catch(
        function errorValue(result) {
            console.log(result);
        }
    );
});

function clearFilter(){
    filters["search_string"] = ""
    filters["classification"] = ""
    filters["category"] = ""
    filters["state"] = ""
    filters["current_page"] = 1
    filters["year"] = ""
    filters["order_by"] = "newer"
    let select = document.getElementById('state-select');
    select.selectedIndex = 0;
    select = document.getElementById('year-select');
    if (select) select.selectedIndex = 0;
    select = document.getElementById('order-select');
    select.selectedIndex = 0;
    select = document.getElementById('category-select');
    select.selectedIndex = 0;
    select = document.getElementById('classification-select');
    select.selectedIndex = 0;
    $("#discovery-input").val("")
}

$('.open-filter-bar #clear-filters').live('click', function(e) {
    e.preventDefault();
    $('.open-filter-bar #filter-bar').css("display", "none");
    $(".open-filter-bar #active-filters").html('');
    $('.open-filter-bar .search-facets-lists input').prop( "checked", false );
    clearFilter();
    cleanCourses();
    initDiscovery();
});

$('.open-order-by-btn').live('click', function(e) {
    e.preventDefault();
    let facet = 'order_by';
    let value = $(this).data("value");
    if($(this).hasClass( "open-order-by-selected" )){
        filters[facet] = "";
        $(this).removeClass("open-order-by-selected");
    }
    else{
        $('.open-order-by-btn').not(this).removeClass("open-order-by-selected");
        $(this).addClass( "open-order-by-selected" );
        filters[facet] = value;
    }
    let list_course4 = getCourses();
    // executes when promise is resolved successfully
    list_course4.then(
        function successValue(result) {
            console.log(result);
        },
    )
    // executes if there is an error
    .catch(
        function errorValue(result) {
            console.log(result);
        }
    );
});
$('.open-filter-bar #filter-bar #active-filters span.fa-times').live('click', function(e) {
    e.preventDefault();
    let btnType = this.parentElement.dataset.type;
    $(this.parentElement).remove();
    if ( $('.open-filter-bar #active-filters').children().length == 0 ) $('.open-filter-bar #filter-bar').css("display", "none");
    filters[btnType] = "";
    $('.open-filter-bar .search-facets-lists input[data-facet="'+btnType+'"]').not(this).prop( "checked", false );

    let list_course2 = getCourses();
    // executes when promise is resolved successfully
    list_course2.then(
        function successValue(result) {
            //console.log(result);
        },
    )
    // executes if there is an error
    .catch(
        function errorValue(result) {
            console.log(result);
        }
    )
    .finally(
        function greet() {
        }
    );
});

$(document).on('click', '#discovery-submit', function(e) {
    e.preventDefault();
    filters["search_string"] = $("#discovery-input").val();
    getCourses();
});

$('#discovery-input').keypress(function(event){
    var keycode = (event.keyCode ? event.keyCode : event.which);
    if(keycode == '13'){
        filters["search_string"] = $("#discovery-input").val();
        getCourses();
    }
});


function getCourses(){
    cleanCourses();
    // returns a promise
    return new Promise(function (resolve, reject) {
        getData().then(function() {
            createPagination();
        });
        resolve('Promise success');
        reject('Promise rejected');
    });
}

function createCourse(data, extra_data){
    /*
    "data": {
        "id": "course-v1:eol+NA303+2022",
        "course": "course-v1:eol+NA303+2022",
        "content": {
            "display_name": "Test202",
            "overview": " About This Course Include your long course description here. The long course description should contain 150-400 words. This is paragraph 2 of the long course description. Add more paragraphs as needed. Make sure to enclose them in paragraph tags. Requirements Add information about the skills and knowledge students need to take this course. Course Staff Staff Member #1 Biography of instructor/staff member #1 Staff Member #2 Biography of instructor/staff member #2 Frequently Asked Questions What web browser should I use? The Open edX platform works best with current versions of Chrome, Edge, Firefox, Internet Explorer, or Safari. See our list of supported browsers for the most up-to-date information. Question #2 Your answer would be displayed here. ",
            "number": "NA303"
        },
        "image_url": "/asset-v1:eol+NA303+2022+type@asset+block@images_course_image.jpg",
        "start": "2022-01-01T00:00:00+00:00",
        "end": "2023-11-30T00:00:00+00:00",
        "number": "NA303",
        "enrollment_start": "2021-01-01T00:00:00+00:00",
        "enrollment_end": "2021-12-31T00:00:00+00:00",
        "org": "eol",
        "modes": [
            "audit"
        ],
        "language": "en",
        'short_description', 'advertised_start', 'display_org_with_default', 'main_classification'
        }
    */
    let button_html = '<button type="button" class="dark-blue-button w-100 mb-0 '
    if (data.course_state == 'ongoing_enrollable' || data.course_state == 'upcoming_enrollable'){
        button_html = button_html + data.course_state +'_color">'+gettext('Enroll now')
    }else if(data.course_state == 'upcoming_notenrollable'){
        button_html = button_html + data.course_state +'_color">'+gettext('Coming soon')
    }else if(data.course_state == 'ongoing_notenrollable'){
        button_html = button_html + data.course_state +'_color">'+gettext('See more')
    }else if (data.course_state == 'completed'){
        button_html = button_html + data.course_state +'_color">'+gettext('Finished')
    }

    button_html =button_html +'</button>'
    const coursehtml = 
    '<div class="col-xl-4 col-lg-10 col-md-12 col-sm-12 mb-3 mx-3 p-2">'+
        '<div class="card {is_active} h-100" data-about="/courses/{course}/about" data-state="{state}" style="cursor: pointer;" onclick="window.location.href = this.dataset.about">'+
            '<div class="row g-0 p-0">'+
                '<div class="col-md-12">'+
                    '<div class="card-body">'+
                        '<div class="row g-0 p-0">'+
                            '<figure><img src="{image_url}" class="card-img-top img-fluid rounded-start" alt="{course_display_name}" onerror="this.onerror=null; this.src=show_default_image()" ></figure>'+
                        '</div>'+
                        '<strong><h5 class="card-title fw-bold my-2" title="{course_display_name}">{course_display_name}</h5></strong>'+
                        '{course_date_html}'+
                        '<div class="card-button mt-2 p-0 mb-0">'+
                            '<a href="/courses/{course}/about">'+ button_html +'</a>'+
                        '</div>'+
                    '</div>'+
                '</div>'+
            '</div>'+
        '</div>'+
    '</div>';
    data['course_date_html'] = create_course_date_html(data.start, extra_data.self_paced, extra_data.effort, extra_data.price)
    data["course_display_name"] = data.content.display_name;
    data["is_active"] = course_is_active(data.end);
    data["state"] = data.course_state || '';
    return edx.HtmlUtils.interpolateHtml(edx.HtmlUtils.HTML(coursehtml), data);
}

function course_is_active(end){
    if (end !== undefined){
        var end_date = new Date(end);
        if(end_date < now) return 'inactive';
    }
    return ''
}

function create_course_date_html(start, self_paced, effort, course_price){
    let duration = '';
    if (effort != undefined){
        duration =
        '<div class="row g-0 p-0">'+
            '<div class="col-2 m-0">'+
                '<div class="open-course-date-icon"><img src="/static/open-uchile-theme/images/svg-2023/fecha inicio.svg"></div>'+
            '</div>'+
            '<div class="col-10">'+
                '<div class="open-course-date-text ml-3">'+
                    '<strong>'+
                        '<span>'+gettext("Duration")+'</span>'+
                    '</strong>'+
                    '<div class="course-date" aria-hidden="true">{effort}</div>'+
                '</div>'+
            '</div>'+
        '</div>'
    }
    const html_new = 
    '<div class="row ct3 my-2">'+
        '<div class="col-md-6 col-sm-12">'+
            '<div class="row g-0 p-0">'+
                '<div class="col-2 m-0">'+
                    '<div class="open-course-date-icon"><img src="/static/open-uchile-theme/images/svg-2023/fecha termino.svg"></div>'+
                '</div>'+
                '<div class="col-10">'+
                    '<div class="open-course-date-text ml-3">'+
                        '<strong>'+
                            '<span>'+gettext("Classes Start")+'</span>'+
                        '</strong>'+
                        '<div class="course-date" aria-hidden="true">{start_date}</div>'+
                    '</div>'+
                '</div>'+
            '</div>'+
        '</div>'+
         '<div class="col-md-6 col-sm-12">'+
            '<div class="row g-0 p-0">'+
                '<div class="col-2 m-0">'+
                    '<div class="open-course-date-icon"><img src="/static/open-uchile-theme/images/svg-2023/modalidad.svg"></div>'+
                '</div>'+
                '<div class="col-10">'+
                    '<div class="open-course-date-text ml-3">'+
                        '<strong>'+
                            '<span>'+gettext("Pacing")+'</span>'+
                        '</strong>'+
                        '<div class="course-date" aria-hidden="true">{self_pace}</div>'+
                    '</div>'+
                '</div>'+
            '</div>'+
        '</div>'+
    '</div>'+
    '<div class="row ct3 my-2">'+
        '<div class="col-md-6 col-sm-12">'+
            '<div class="row g-0 p-0">'+
                '<div class="col-2 m-0">'+
                    '<div class="open-course-date-icon"><img src="/static/open-uchile-theme/images/svg-2023/precio.svg"></div>'+
                '</div>'+
                '<div class="col-10">'+
                    '<div class="open-course-date-text ml-3">'+
                        '<strong>'+
                            '<span>'+gettext("Price")+'</span>'+
                        '</strong>'+
                        '<div class="course-date" aria-hidden="true">{price}</div>'+
                    '</div>'+
                '</div>'+
            '</div>'+
        '</div>'+
        '<div class="col-md-6 col-sm-12">'+
            duration +
        '</div>'+
    '</div>';
    let price = course_price
    if (course_price !== 'Free' && course_price !== 'Gratis' && course_price !== 'None' && course_price !== undefined){  
        price_without_symbol =parseInt(course_price.slice(1));
        price = price_without_symbol.toLocaleString('es-CL');
        price = '$'+ price
    }
    else {
        price = gettext("Free")
    }

    var start_date  = new Date(start);
    var date_data = {
        'start_date': translate_date(start_date),
        'self_pace': self_paced ? gettext('Student paced') : gettext('Instructor paced'),
        'effort': effort,
        'price': price
    };
    return edx.HtmlUtils.interpolateHtml(edx.HtmlUtils.HTML(html_new), date_data);
}

function translate_date(date){
    var options = { year: 'numeric', month: 'short', day: 'numeric' };
    if(document.documentElement.lang == "es-419" ){
    return date.toLocaleDateString("es-ES", options);
    }
    return date.toLocaleDateString("en-US", options);
}

function cleanCourses(){
    $(".open-filter-bar #discovery-message").text("");
    $("#list-courses").empty();
}

