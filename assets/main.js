// var inputLeft = document.getElementById("input-left");
// var inputRight = document.getElementById("input-right");

// var thumbLeft = document.querySelector(".thumb.left");
// var thumbRight = document.querySelector(".thumb.right");
// var range = document.querySelector(".slider-c > .range");

const POST_PER_PAGE = 5;
var DOCUMENT_READY=false;
var START_FETCH=false;
var PRICE_CHANGED=false;
var aborter = null;
var ALL_DISCIPLINAS=[];
let UNIVERSIDADES=[];
let LANG=null;

jQuery( document ).ready(function() {
    jQuery('#select-subdisciplina+.select2-container').hide();
    TIPO_ESTUDIOS.forEach(tipoEstudio=>{
        let optionHtml=`<option value="${tipoEstudio.value}">${tipoEstudio.name}</span></option>`
        jQuery('#select-tipo-studios').append(optionHtml);
    });
    /**
     * End multi range
     */
    PAICES.forEach(pais=>{
        let optionHtml=`<option value="${pais.value}">${pais.name}</span></option>`
        jQuery('#select-pais').append(optionHtml);
    });

 /*    UNIVERSIDADES.forEach(item=>{
        let optionHtml=`<option value="${item.value}">${item.name}</span></option>`
        jQuery('#select-universidad').append(optionHtml);
    }); */

    getDisciplinas()
    .then(disciplinas=>{
        jQuery('#loader-disciplinas').fadeOut(800);
        disciplinas.forEach(disciplina => {
            // let shortcode='[super_search_pais pais="irlanda" disciplina_id="'+disciplina.term_id+'"]'+disciplina.name;
            // console.log(shortcode);
            let optionHtml=`<option value="${disciplina.term_id}">${disciplina.name}</span></option>`
            jQuery('#select-disciplinas').append(optionHtml);    
        });
        jQuery('#select-disciplinas').fadeIn(800);
        jQuery('#loader-disciplinas').hide(800);
    });
    
    getUniversities()
    .then(universities=>{
        
        universities.forEach(university => {
            // let shortcode='[super_search_pais pais="irlanda" disciplina_id="'+disciplina.term_id+'"]'+disciplina.name;
            // console.log(shortcode);
            let optionHtml=`<option value="${university}">${university}</span></option>`
            jQuery('#select-universidad').append(optionHtml);
        });
        jQuery('#select-disciplinas').fadeIn(800);
        jQuery('#loader-disciplinas').hide(800);
    });
    
    initPostPropgramas();
    
    var universidades = new Bloodhound({
        queryTokenizer: Bloodhound.tokenizers.whitespace,
        datumTokenizer: Bloodhound.tokenizers.obj.whitespace('name'),
        // `states` is an array of state names defined in "The Basics"
        local: UNIVERSIDADES
    });
    var contrys = new Bloodhound({
        queryTokenizer: Bloodhound.tokenizers.whitespace,
        datumTokenizer: Bloodhound.tokenizers.obj.whitespace('name'),
        // `states` is an array of state names defined in "The Basics"
        local: PAICES
    });
    
    jQuery('#search-by-location').typeahead(
        {
            highlight: true
        }, 
        {
            // displayKey: 'name',
            displayKey: (data)=>data.name,
            source: universidades.ttAdapter(),
            templates: {
                header: '<label class="ml-3">Escuelas</label>',
                suggestion: (data)=>{
                    return(`
                        <div class="suggestion-container">
                            <span>${data.name}</span>
                            <small class="suggestion-country">${data.contry}</small>
                        </div>
                    `)
                },
            }
        },
        {
            displayKey: 'name',
            source: contrys.ttAdapter(),
            templates: {
                header: '<label class="ml-3">Países</label>'
            }
        }
    );
    setAllDisciplinas()
    .then(items=>{
        ALL_DISCIPLINAS=items;
        var disciplinas = new Bloodhound({
            queryTokenizer: Bloodhound.tokenizers.whitespace,
            datumTokenizer: Bloodhound.tokenizers.obj.whitespace('name'),
            // `states` is an array of state names defined in "The Basics"
            local: ALL_DISCIPLINAS
        });
      
        jQuery('#search-by-disciplina').typeahead(null, {
            displayKey: 'name',
            source: disciplinas.ttAdapter(),
            // templates: {
            //     header: '<label class="ml-3">Disciplinas</label>'
            // }
        });
    });
    
    DOCUMENT_READY=true;
});

// inputLeft.addEventListener("input", setLeftValue);
// inputRight.addEventListener("input", setRightValue);

jQuery(document).on('click', '#prev', function(){
    const pagina = parseInt(jQuery('#input-pagination_number').val())-1;
    jQuery('#input-pagination_number').val(pagina);
    jQuery('#current-pagination').text(pagina);
    jQuery("html, body").animate({ scrollTop: 0 }, "fast");
    initPostPropgramas();
});
jQuery(document).on('click', '.toggle-filters', function(){
    jQuery('#filters-container').toggle();
    jQuery('.toggle-filters >img').toggleClass('active');
});
jQuery(document).on('click', '#next', function(){
    const pagina = parseInt(jQuery('#input-pagination_number').val())+1;
    jQuery('#input-pagination_number').val(pagina);
    jQuery('#current-pagination').text(pagina);
    jQuery("html, body").animate({ scrollTop: 0 }, "fast");
    initPostPropgramas();
});
jQuery(document).on('click', '#deleted-filters', function(){
    if(jQuery('#select-tipo-studios').hasClass('select2-hidden-accessible')){
        jQuery('#select-tipo-studios').val(0).trigger('change');
    }else {
        document.getElementById('select-tipo-studios').value = 0;
    }
    if(jQuery('#select-disciplinas').hasClass('select2-hidden-accessible')){
        jQuery('#select-disciplinas').val(0).trigger('change');
    }else {
        document.getElementById('select-disciplinas').value = 0;
    }
    if(jQuery('#select-subdisciplina').hasClass('select2-hidden-accessible')){
        jQuery('#select-subdisciplina').val(0).trigger('change');
    }else {
        document.getElementById('select-subdisciplina').value = 0;
    }
    if(jQuery('#select-pais').hasClass('select2-hidden-accessible')){
        jQuery('#select-pais').val(0).trigger('change');
    }else {
        document.getElementById('select-pais').value = 0;
    }
    if(jQuery('#select-universidad').hasClass('select2-hidden-accessible')){
        jQuery('#select-universidad').val(0).trigger('change');
    }else {
        document.getElementById('select-universidad').value = 0;
    }
    initPostPropgramas();
   
});
jQuery(document).on('change', '#select-tipo-studios, #select-subdisciplina, #select-universidad', function(){
    jQuery('#input-pagination_number').val(1);
    
    //jQuery('#current-pagination').text(1);
    //console.log(jQuery('#input-pagination_number').val());
    jQuery('#prev').prop( "disabled", true );
    jQuery('#next').prop( "disabled", false );
    initPostPropgramas(false,true);
});

jQuery(document).on('input', '#search-by-location, #search-by-disciplina', function(){
    
    if( jQuery('#search-by-disciplina').val() == '' && jQuery('#search-by-location').val() == '') {
        initPostPropgramas();
    }else{
        if(jQuery('#search-by-disciplina').val() != '' || jQuery('#search-by-location').val() != ''){
            initPostPropgramas(true);
        }
    }
});


jQuery('#search-by-location, #search-by-disciplina').bind('typeahead:select', function(ev, suggestion) { 
    if( DOCUMENT_READY ) {
        initPostPropgramas(true);
    }
});


jQuery(document).on('input', '#min-price, #max-price', function(){
    if( DOCUMENT_READY ) {
        PRICE_CHANGED=true
        jQuery('#input-pagination_number').val(1);
        jQuery('#prev').prop( "disabled", true );
        jQuery('#next').prop( "disabled", false );
        initPostPropgramas();
    }
});

jQuery(document).on('change', '#select-pais', function(){
    jQuery('#input-pagination_number').val(1);
    jQuery('#prev').prop( "disabled", true );
    jQuery('#next').prop( "disabled", false );

    const tempUni = [...UNIVERSIDADES]
    const universidadByPais = tempUni.filter(item=>item.contry==this.value);
    
    jQuery('#select-universidad').empty().append('<option value="0"><span id="nice-universidad">Universidad...</span></option>');
    universidadByPais.forEach(item=> jQuery('#select-universidad').append(`<option value="${item.value}">${item.name}</span></option>`) );
    initPostPropgramas(false,true);
});

jQuery(document).on('change','#input-left, #input-right', function(){
    if( DOCUMENT_READY ) {
        PRICE_CHANGED=true
        //initPostPropgramas();
        initPostPropgramas(false,true);
    }
});

jQuery(document).on('change', '#select-disciplinas', async function(){
    
    try {
        jQuery('#input-pagination_number').val(1);
        jQuery('#prev').prop( "disabled", true );
        jQuery('#next').prop( "disabled", false );

        initPostPropgramas(false,true);
        jQuery('#nice-tipo-subdisciplina').text('');
        jQuery('.hr, #select-subdisciplina').hide(800);
        jQuery('#select-subdisciplina+.select2-container').hide();
        if( this.value !=0 ){
            jQuery('#nice-tipo-subdisciplina').text( jQuery("#select-disciplinas option:selected" ).text() );
            jQuery('#loader-subdisciplina, .hr').show(800);
            const response = await fetch(`/wp-json/devtzal/v1/subdisciplinas?id=${this.value}`);
            const data = await response.json();
            
            jQuery('#select-subdisciplina').empty().append('<option value="0"><span id="nice-universidad">Subdisciplina...</span></option>');
            
            data.forEach(item=> jQuery('#select-subdisciplina').append(`<option value="${item.term_id}">${item.name}</span></option>`) );

            jQuery('#loader-subdisciplina').hide(800);
            jQuery('#select-subdisciplina').show(800);
            jQuery('#select-subdisciplina+.select2-container').show(800);
        }
    } catch (error) {
       console.log(error);
    }
    
});

var substringMatcher = function(strs) {
    return function findMatches(q, cb) {
      var matches, substringRegex;
  
      // an array that will be populated with substring matches
      matches = [];
  
      // regex used to determine if a string contains the substring `q`
      substrRegex = new RegExp(q, 'i');
  
      // iterate through the pool of strings and for any string that
      // contains the substring `q`, add it to the `matches` array
      $.each(strs, function(i, str) {
        if (substrRegex.test(str)) {
          matches.push(str);
        }
      });
  
      cb(matches);
    };
  };

const getInputsData=()=>{
    const tipoEstudio = jQuery('#select-tipo-studios option:selected').val() == 0 ? null : jQuery('#select-tipo-studios option:selected').val();
    const disciplina = jQuery('#select-disciplinas option:selected').val() == 0 ? null : jQuery('#select-disciplinas option:selected').val();
    const subdisciplina = jQuery('#select-subdisciplina option:selected').val() == 0 ? null : jQuery('#select-subdisciplina option:selected').val();
    const universidad = jQuery('#select-universidad option:selected').val() == 0 ? null : jQuery('#select-universidad option:selected').text();
    const pais = jQuery('#select-pais option:selected').val() == 0 ? null : jQuery('#select-pais option:selected').val();
    const minPrice = jQuery('#min-price').val() == 0 ? null : jQuery('#min-price').val();
    const maxPrice = jQuery('#max-price').val() == 0 ? null : jQuery('#max-price').val();
    
    const queryData={
        tipoEstudio:tipoEstudio,
        disciplina:disciplina,
        subdisciplina: disciplina != null ? subdisciplina : null,
        universidad:universidad,
        pais:pais,
        pagination_number:jQuery('#input-pagination_number').val(),
        posts_per_page:POST_PER_PAGE,
    };
    
    if(DOCUMENT_READY && PRICE_CHANGED){
        queryData.minPrice=minPrice;
        queryData.maxPrice=maxPrice;
    }
    return queryData;
}
const initPostPropgramas=async ( fromText=false, restartPagination=false )=>{
    if(!fromText && DOCUMENT_READY)jQuery('#search-by-location, #search-by-disciplina').typeahead('val', null);
    try {
        jQuery('#contentProgramas').html(`<div class="d-flex justify-content-center"><div class="spinner-border" style="width: 3rem; height: 3rem;" role="status"></div></div>`);
        PROGRAMAS = await getProgramas(fromText);
        const pagina = parseInt(jQuery('#input-pagination_number').val())+1;
        if(restartPagination){
            if(parseInt(jQuery('#total-paginations').val()) == 0){
                jQuery('#current-pagination').text(jQuery('#total-paginations').val());
            }else{
                jQuery('#current-pagination').text(jQuery('#input-pagination_number').val());
            }
            
        }
        //jQuery('#current-pagination').text(pagina);
        if(PROGRAMAS.length >0){
            let html = '';
            PROGRAMAS.forEach(programa => html += buildProgramaCard(programa) );
            jQuery('#contentProgramas').html(html);
            jQuery('.middle').show(800);
        }else{
            jQuery('#contentProgramas').html(`<div class="d-flex justify-content-center">No se han encontrado resultados con tu criterio de búsqueda</div>`);
        }
    
    } catch (error) {
        
    }
}
// function setLeftValue() {
//     var _this = inputLeft,
//         min = parseInt(_this.min),
//         max = parseInt(_this.max);

//     _this.value = Math.min(parseInt(_this.value), parseInt(inputRight.value) - 1);

//     var percent = ((_this.value - min) / (max - min)) * 100;

//     thumbLeft.style.left = percent + "%";
//     range.style.left = percent + "%";
//     jQuery('#label-min-price').text(`$${jQuery('#input-left').val()}`);
//     jQuery('#input-pagination_number').val(1);
//     jQuery('#prev').prop( "disabled", true );
//     jQuery('#next').prop( "disabled", false );
    
    
// }
// function setRightValue() {
//     var _this = inputRight,
//         min = parseInt(_this.min),
//         max = parseInt(_this.max);

//     _this.value = Math.max(parseInt(_this.value), parseInt(inputLeft.value) + 1);

//     var percent = ((_this.value - min) / (max - min)) * 100;

//     thumbRight.style.right = (100 - percent) + "%";
//     range.style.right = (100 - percent) + "%";
//     jQuery('#label-max-price').text(`$${jQuery('#input-right').val()}`);
//     jQuery('#input-pagination_number').val(1);
//     jQuery('#prev').prop( "disabled", true );
//     jQuery('#next').prop( "disabled", false );
    
// }
const getProgramas = async (fromText=false)=>{
    
    try {
        if(aborter) aborter.abort();
 
        // make our request cancellable
        aborter = new AbortController();
        const signal = aborter.signal;
        const bodyInputs =  getInputsData();
        
        
        const bodyFromText = {
            disciplina: jQuery('#search-by-disciplina').val(),
            universidad:jQuery('#search-by-location').val(),
            pais:jQuery('#search-by-location').val(),
            fromText:1,
            pagination_number:jQuery('#input-pagination_number').val(),
            posts_per_page:POST_PER_PAGE,
        };

        var response = null;
        console.log("response:");
        console.log(bodyInputs);
        if(fromText)
        {
            console.log("response1:");
            response = await fetch(`/wp-json/devtzal/v1/programas/all?posts_per_page=${bodyFromText.posts_per_page}&pagination_number=${bodyFromText.pagination_number}&disciplina=${bodyFromText.disciplina}&lang=${LANG}`);
        }else{
            console.log("response2:");
            console.log(bodyInputs);
            response = await fetch(`/wp-json/devtzal/v1/programas/all?posts_per_page=${bodyInputs.posts_per_page}&pagination_number=${bodyInputs.pagination_number}&disciplina=${bodyInputs.disciplina}&subdisciplina=${bodyInputs.subdisciplina}&lang=${LANG}`);
        }
        
        // const response = await fetch('/wp-json/devtzal/v1/programas/all',{
        //         method: 'POST',
        //         signal:signal,
        //         headers: {
        //             'Accept': 'application/json',
        //             'Content-Type': 'application/json'
        //           },
        //         body: fromText ? bodyFromText : bodyInputs
        //     }
        // );

        const dataProgramas= await response.json();
        console.log(dataProgramas);
        aborter = null;
        jQuery('#total-paginations').text(dataProgramas.total_pagination);
        handlePaginationButtons(dataProgramas.total_pagination);
        return dataProgramas.posts;
    } catch (error) {
        // console.log(error);
    }
};
const handlePaginationButtons=(total_pagination)=>{
    if( jQuery('#input-pagination_number').val()>1 ){
        jQuery('#prev').prop( "disabled", false );
    }else{
        jQuery('#prev').prop( "disabled", true );
    }
    if( jQuery('#input-pagination_number').val()>=total_pagination ){
        jQuery('#next').prop( "disabled", true );
    }else{
        jQuery('#next').prop( "disabled", false );
    }
}
const getDisciplinas = async ()=>{
    const response = await fetch('/wp-json/devtzal/v1/disciplinas');
    const dataDisciplinas= await response.json();
    return dataDisciplinas;
};
const setAllDisciplinas = async ()=>{
    const response = await fetch('/wp-json/devtzal/v1/disciplinas?all=1');
    const dataDisciplinas= await response.json();
    return dataDisciplinas;
};
const getUniversities = async ()=>{
    
    let disciplina = jQuery('#select-disciplinas option:selected').val() == 0 ? null : jQuery('#select-disciplinas option:selected').val();
    var response = null;
    if(disciplina != null){
        response = await fetch('/wp-json/devtzal/v1/universities?disciplina='+disciplina);
    }else{
        response = await fetch('/wp-json/devtzal/v1/universities');
    }
    
   
    const dataUniversities= await response.json();
    UNIVERSIDADES = dataUniversities;
    console.log(dataUniversities);
    return dataUniversities;
};
const buildProgramaCard=(programa)=>{
    console.log(programa);
    const img =url=>{
        if(url){
            return`<img class="programas-img mt-3" src="${programa.image}" />`
        }else{
            return '';
        }
    }
    return`
    
        <div class="row r-programas post-list click-post" onclick="window.open('${programa.permalink}')">
            <div class="col-12 col-md-3">
                <div class="title-img text-center">
                    <a href="${programa.permalink}">
                        ${img(programa.image)}
                    </a>
                    
                </div>
            </div>
            <div class="col-12 col-md-9">
                <div class="row lscf-post-heading align-items-center">
                    <div class="col-12 col-md-8">
                        <div class="caption-container title-post mt-1 mb-2">
                            <a class="list-view lscf-title ng-binding post-title text-left" href="${programa.permalink}" >${programa.post_title}</a>
                        </div>
                        <div class="caption  overflow-hidden">
                            ${programa.post_excerpt}
                        </div>
                    </div>

                    <div class="col-12 col-md-4 lscf-price-label" style="text-align: right">
                        <div class="price ng-scope text-center text-sm-right" >
                            <div class="price mb-3 mt-1" >${programa.precio_nice==0 ? '' : programa.precio_nice} ${programa.precio_nice==0? '':programa.moneda} ${programa.precio_nice==0? '':'/ año'}</div>
                            <div class="price my-3 mb-3 mb-sm-3">${programa.duracion=='0/ año' ? '' : programa.duracion}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
};

let PROGRAMAS=[];
let TIPO_ESTUDIOS=[
    {
        name:'Licenciatura',
        value:'Licenciatura',
    },
        {
         name:'Honors Bachelor',
        value:'Licenciatura con Honores',
    },
    {
        name:'Master',
        value:'Maestría',
    },
    {
        name:'Languages',
        value:'Inglés',
    },
]
let PAICES=[
    {
        name:'Irlanda',
        value:'Irlanda',
    },
    {
        name:'Alemania',
        value:'alemania',
    },
    {
        name:'Australia',
        value:'australia',
    },
    {
        name:'Canadá',
        value:'canadá',
    },
];

/* let UNIVERSIDADES=[
    {
        name: 'University College Cork',
        value:1,
        contry:'irlanda'
    },
    {
        name: 'University of Limerick',
        value:2,
        contry:'irlanda'
    },
    {
        name: 'University College Dublin',
        value:3,
        contry:'irlanda'
    },
    {
        name: 'National University of Ireland Galway',
        value:4,
        contry:'irlanda'
    },
    {
        name: 'Dublin City University',
        value:5,
        contry:'irlanda'
    },
    {
        name: 'Dundalk Institute of Technology',
        value:6,
        contry:'irlanda'
    },
    {
        name: 'Dublin Business School',
        value:7,
        contry:'irlanda'
    },
    {
        name: 'Griffith College Dublin',
        value:8,
        contry:'Irlanda'
    },
    {
        name: 'Technological University Dublin',
        value:9,
        contry:'irlanda'
    },
    {
        name: 'IBAT College',
        value:10,
        contry:'irlanda'
    },
    {
        name: 'Greystone College',
        value:11,
        contry:'canadá'
    },
    {
        name: 'Toronto School of Management',
        value:12,
        contry:'canadá'
    },
    {
        name: 'University Canada West',
        value:13,
        contry:'canadá'
    },
    {
        name: 'Gisma Business School',
        value:15,
        contry:'alemania'
    },
    {
        name: 'Greystone College',
        value:16,
        contry: 'australia'
    },
    {
        name: 'Apollo Language Centre',
        value:17,
        contry: 'irlanda'
    },
    {
        name: 'Trinity College Dublin',
        value:18,
        contry:'irlanda',
    },
    {
        name: 'Institute of Technology Carlow',
        value:19,
        contry:'irlanda',
    },
    {
        name: 'Waterford Institute of Technology',
        value:20,
        contry:'irlanda',
    },
    {
        name: 'Athlone Institute of Technology',
        value:21,
        contry:'irlanda',
    },
    {
        name: 'Letterkenny Institute of Technology',
        value:22,
        contry:'irlanda',
    },
    {
        name: 'National College of Ireland',
        value:23,
        contry:'irlanda',
    },
    {
        name: 'Trebas Institute',
        value:24,
        contry:'canadá',
    },
    
];
 */