var now = new Date();

var index = 0;
var currentTotal = 0;
var state = 0 //0:can get data 1:waiting data 2: no more data
var filters = {
    "search_string": "",
    "order_by": "newer",
    "year": "",
    "state": "",
    "classification": "",
    "category": ""
}

$(window).load(function() {
    clearFilter();
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
        $(`input[type="checkbox"][data-facet="classification"][data-value="${selectedOrganization}"]`).prop('checked', true);
    }
    if (urlParams.has('category')){ 
        const selectedCategory = urlParams.get('category');
        filters["category"] = selectedCategory;
        $(`input[type="checkbox"][data-facet="category"][data-value="${selectedCategory}"]`).prop('checked', true);
    }
    initDiscovery();
    // TODO: create pagination
    // $(window).scroll(function() {
    // if($(window).scrollTop()  > $(window).height() / 2) {
    //     if (state == 0){
    //         state = 1;
    //         getData();
    //     }
    // }
    // })
});
function initDiscovery(){
    index = 0;
    currentTotal = 0;
    state = 1;
    getData();
}

function getData(){
    var pages = {"page_size": 100, "page_index": index }
    var copy = {...filters, ...pages};
    $.post( "/course_classification/search/", copy )
    .done(function( data ) {
        if (data.error == undefined) {
            let element_added = 0
            if (data.results.length != 1){
                for (let i = 0; i < data.results.length -1; i += 2) {
                    const container = document.getElementById("list-courses"); 
                    const courseHtml = createCourse(data.results[i], data.results[i].extra_data);
                    const courseHtml2 = createCourse(data.results[i+1], data.results[i+1].extra_data);
                    row = document.createElement('div');
                    row.className = 'row d-flex justify-content-center w-100';
                    container.appendChild(row);
                    edx.HtmlUtils.append(row, courseHtml);
                    edx.HtmlUtils.append(row, courseHtml2);
                }
            }
            if (data.results.length % 2 !== 0){
                const container = document.getElementById("list-courses"); 
                const courseHtml = createCourse(data.results[data.results.length - 1], data.results[data.results.length - 1].extra_data);
                const courseHtml2 = edx.HtmlUtils.HTML('<div class="col-xl-4 col-lg-10 col-md-12 col-sm-12 mb-3 mx-3 p-2"></div>') 
                row = document.createElement('div');
                row.className = 'row d-flex justify-content-center w-100';
                container.appendChild(row);
                edx.HtmlUtils.append(row, courseHtml);
                edx.HtmlUtils.append(row, courseHtml2);
            }
        }else{
            console.log("ERROR:" + data.error)
        }

        currentTotal = currentTotal + data.results.length;
        if (data.total > currentTotal){
            index = index + 1;
            state = 0;
        }
        else state = 2;
        $(".open-filter-bar #discovery-message").text(gettext("Showing")+" " + data.results.length  + " "+ gettext("courses"));
    });
}

$('#advance-button').live('click', function(e) {
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

$('.open-filter-bar .search-facets-lists input[type="checkbox"]').live('change', function(e) {
    e.preventDefault();
    let facet = $(this).data("facet");
    if (this.checked){
        filters[facet] = $(this).data("value");
        $('.open-filter-bar .search-facets-lists input[data-facet="'+facet+'"]').not(this).prop( "checked", false );
    }
    else{
        filters[facet] = "";
    }

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

$('#state-select, #year-select, #order-select').live('change', function(e) {
    e.preventDefault();
    let facet = $(this).data("facet");
    filters[facet] = gettext($(this)[0].value);

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
    filters["year"] = ""
    filters["order_by"] = "newer"
    let select = document.getElementById('state-select');
    select.selectedIndex = 0;
    select = document.getElementById('year-select');
    if (select) select.selectedIndex = 0;
    select = document.getElementById('order-select');
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

$('#discovery-submit').live('click', function(e) {
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
        getData();
        //pasar datos a resolve
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
    data['course_date_html'] = create_course_date_html(data.start, data.advertised_start, extra_data.self_paced, extra_data.effort, extra_data.price)
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

function create_course_date_html(start, advertised_start, self_paced, effort, course_price){
    let duration = '';
    let start_date = '';
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

    if (advertised_start === null || advertised_start === undefined) {
        var aux_date = new Date(start)
        start_date = translate_date( aux_date);
    } else {
        start_date = advertised_start
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

    var date_data = {
        'start_date': start_date,
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
    index = 0;
    currentTotal = 0;
    state = 1;
    $(".open-filter-bar #discovery-message").text("");
    $("#list-courses").empty();
}

