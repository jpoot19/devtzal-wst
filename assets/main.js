// var inputLeft = document.getElementById("input-left");
// var inputRight = document.getElementById("input-right");

// var thumbLeft = document.querySelector(".thumb.left");
// var thumbRight = document.querySelector(".thumb.right");
// var range = document.querySelector(".slider-c > .range");

const POST_PER_PAGE = 10;
var DOCUMENT_READY=false;
var START_FETCH=false;
var PRICE_CHANGED=false;
var aborter = null;
var ALL_DISCIPLINAS=[];

jQuery( document ).ready(function() {  
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

    UNIVERSIDADES.forEach(item=>{
        let optionHtml=`<option value="${item.value}">${item.name}</span></option>`
        jQuery('#select-universidad').append(optionHtml);
    });

    getDisciplinas()
    .then(disciplinas=>{
        jQuery('#loader-disciplinas').fadeOut(800);
        disciplinas.forEach(disciplina => {
            let optionHtml=`<option value="${disciplina.term_id}">${disciplina.name}</span></option>`
            jQuery('#select-disciplinas').append(optionHtml);    
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
                            <small>${data.contry}</small>
                        </div>
                    `)
                },
            }
        },
        {
            displayKey: 'name',
            source: contrys.ttAdapter(),
            templates: {
                header: '<label class="ml-3">Paíces</label>'
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
            templates: {
                header: '<label class="ml-3">Disciplinas</label>'
            }
        });
    });
    
    DOCUMENT_READY=true;
});

// inputLeft.addEventListener("input", setLeftValue);
// inputRight.addEventListener("input", setRightValue);
jQuery(document).on('click', '.click-post', function(){
    jQuery('#input-pagination_number').val(parseInt(jQuery('#input-pagination_number').val())-1);
    jQuery("html, body").animate({ scrollTop: 0 }, "fast");
    initPostPropgramas();
});
jQuery(document).on('click', '#prev', function(){
    jQuery('#input-pagination_number').val(parseInt(jQuery('#input-pagination_number').val())-1);
    jQuery("html, body").animate({ scrollTop: 0 }, "fast");
    initPostPropgramas();
});
jQuery(document).on('click', '#next', function(){
    jQuery('#input-pagination_number').val(parseInt(jQuery('#input-pagination_number').val())+1);
    jQuery("html, body").animate({ scrollTop: 0 }, "fast");
    initPostPropgramas();
});

jQuery(document).on('change', '#select-tipo-studios, #select-subdisciplina, #select-universidad', function(){
    jQuery('#input-pagination_number').val(1);
    jQuery('#prev').prop( "disabled", true );
    jQuery('#next').prop( "disabled", false );
    initPostPropgramas();
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
    initPostPropgramas();
});

jQuery(document).on('change','#input-left, #input-right', function(){
    if( DOCUMENT_READY ) {
        PRICE_CHANGED=true
        initPostPropgramas();
    }
});

jQuery(document).on('change', '#select-disciplinas', async function(){
    try {
        jQuery('#input-pagination_number').val(1);
        jQuery('#prev').prop( "disabled", true );
        jQuery('#next').prop( "disabled", false );

        initPostPropgramas();
        jQuery('#nice-tipo-subdisciplina').text('');
        jQuery('.hr, #select-subdisciplina').hide(800);
        if( this.value !=0 ){
            jQuery('#nice-tipo-subdisciplina').text( jQuery("#select-disciplinas option:selected" ).text() );
            jQuery('#loader-subdisciplina, .hr').show(800);
            const response = await fetch(`/wp-json/devtzal/v1/subdisciplinas?id=${this.value}`);
            const data = await response.json();
            
            jQuery('#select-subdisciplina').empty().append('<option value="0"><span id="nice-universidad">Select...</span></option>');
            
            data.forEach(item=> jQuery('#select-subdisciplina').append(`<option value="${item.term_id}">${item.name}</span></option>`) );

            jQuery('#loader-subdisciplina').hide(800);
            jQuery('#select-subdisciplina').show(800);
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
        subdisciplina:subdisciplina,
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
const initPostPropgramas=async ( fromText=false )=>{
    if(!fromText && DOCUMENT_READY)jQuery('#search-by-location, #search-by-disciplina').typeahead('val', null);
    try {
        jQuery('#contentProgramas').html(`<div class="d-flex justify-content-center"><div class="spinner-border" style="width: 3rem; height: 3rem;" role="status"></div></div>`);
        PROGRAMAS = await getProgramas(fromText);
        
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
        const bodyInputs = JSON.stringify( getInputsData() )
        
        const bodyFromText = JSON.stringify({
            disciplina: jQuery('#search-by-disciplina').val(),
            universidad:jQuery('#search-by-location').val(),
            pais:jQuery('#search-by-location').val(),
            fromText:1,
            pagination_number:jQuery('#input-pagination_number').val(),
            posts_per_page:POST_PER_PAGE,
        })

        const response = await fetch('/wp-json/devtzal/v1/programas/all',{
                method: 'POST',
                signal:signal,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                  },
                body: fromText ? bodyFromText : bodyInputs
            }
        );
        const dataProgramas= await response.json();
        aborter = null;
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
const buildProgramaCard=(programa)=>{
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
                    <label class="title-universiad" >${programa.universidad}</label>
                </div>
            </div>
            <div class="col-12 col-md-9">
                <div class="row lscf-post-heading align-items-center">
                    <div class="col-12 col-md-8">
                        <div class="caption-container title-post mt-1">
                            <a class="list-view lscf-title ng-binding post-title text-left" href="${programa.permalink}" >${programa.post_title}</a>
                        </div>
                        <div class="caption  overflow-hidden">
                            ${programa.post_excerpt}
                        </div>
                    </div>

                    <div class="col-12 col-md-4 lscf-price-label" style="text-align: right">
                        <div class="price ng-scope text-align" >
                            <label class="price mb-3 mt-1" >${programa.precio_nice} ${programa.moneda}/ año</label
                            <label class="price my-3">${programa.duracion}</label>
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
        name:'Licenciatura con Honores',
        value:'Licenciatura con Honores',
    },
    {
        name:'Maestría',
        value:'Maestría',
    },
    {
        name:'Idiomas',
        value:'Idiomas',
    },
]
let PAICES=[
    {
        name:'Irlanda',
        value:'irlanda',
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
        value:'canada',
    },
];

let UNIVERSIDADES=[
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
        name: 'NUI Galway',
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
        contry:'irlanda'
    },
    {
        name: 'Technological University Dublin',
        value:9,
        contry:'irlanda'
    },
    {
        name: 'iBAT College Dublin',
        value:10,
        contry:'irlanda'
    },
    {
        name: 'Greystone College Canada',
        value:11,
        contry:'canada'
    },
    {
        name: 'Toronto School of Management',
        value:12,
        contry:'canada'
    },
    {
        name: 'University Canada West',
        value:13,
        contry:'canada'
    },
    {
        name: 'GISMA',
        value:14,
        contry:'Irlanda'
    },
    {
        name: 'GISMA',
        value:15,
        contry:'alemania'
    },
    {
        name: 'Greystone College Australia',
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
        name:'irlanda',
    }
    
];