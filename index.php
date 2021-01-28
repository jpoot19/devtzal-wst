<?php
/*
Plugin Name: Devtzal Wst
Plugin URI: https://devtzal.com/
Description: Plugin .
Version: 1.0
Author: Jose Briceño

*/

if ( !function_exists('add_action') ){
    exit;
}

function enqueue(){
    wp_enqueue_style('dtz_wst_style', plugins_url('/assets/style.css', __FILE__) );
}

add_action('admin_menu', 'setup_menu'); 
function setup_menu(){
    add_menu_page( 'Super Search Devtzal', 'Super Search Dtz', 'manage_options', 'dtz_plugin', 'init_admin_content' );
}
function init_admin_content(){
    $content='';
    $types = get_post_types( [], 'objects' );
    $content.='<div class="wrap">';
    $content.=' <h3>Selecciono los post para mostrar</h3>';
    // foreach ( $types as $type ) {
    //     if($type->public){
    //         $content .= " {$type->name}<br/>";
    //         // if( $type->taxonomies ){
    //         //     foreach($type->taxonomies){
    //         //     }
    //         //     $content .= $type->name.'<br/>';
    //         // }
    //         // print_r($type->taxonomies);
    //     }
    // }
    // $content.='</div>';
    echo $content;
}
function content_por_pais( $atts ){
    $pais =  $atts['pais'];
    $disciplina_id =  $atts['disciplina_id'];
    
    devtzal_enqueue_script();
    wp_register_script('main_pais', plugins_url('/assets/main_pais.js?time='.rand(),__FILE__ ), [], '', true);
    wp_enqueue_script('main_pais');
    
    $content='';
    $types = get_post_types( [], 'objects' );
    
    $content.='
        <div class="row justify-content-end">
            
            <div class="col-12 col-sm-3">
              <div class="row">
                <button type="button" id="nice-busqueda" class="btn btn-outline-primary text-left mb-3 col-12 toggle-filters">
                  Búsqueda
                  <img src="'.plugins_url('/assets/arrow-down-sign-to-navigate.png',__FILE__).'" width="1em" class="d-sm-none"/>
                </button>
              </div>
              <div class="row" id="filters-container">        
                <div class="position-fixed_ col-12">
                    <button type="button" id="deleted-filters" class="btn btn-primary">Eliminar Filtros</button>
                    <div>
                      <span id="nice-tipo-estudios">Tipo de estudios</span>
                      <select class="form-select" id="select-tipo-studios">
                        <option value="0"><span id="nice-tipo-estudios">Tipo de estudios...</span></option>
                      </select>
                    </div>
                    
                    <div>
                      <hr class="my-4"/>
                      <span id="nice-tipo-disciplinas">Disciplinas</span>
                      <div class="spinner-border spinner-border-sm" id="loader-disciplinas" role="status"></div>
                      <select class="form-select" id="select-disciplinas" style="display:none;">
                        <option value="0" ><span id="nice-disciplinas">Disciplinas...</span></option>
                      </select>
                    </div>
                    
                    <div  id="container-subdisciplina">
                      <hr class="my-4 hr" style="display:none;"/>
                      <span id="nice-tipo-subdisciplina"></span>
                      <div class="spinner-border spinner-border-sm" id="loader-subdisciplina" role="status" style="display:none;"></div>
                      <select class="form-select" id="select-subdisciplina" style="display:none;">
                        <option ><span id="nice-subdisciplina"></span></option>
                      </select>
                    </div>
                    <div id="paise-container">
                      <hr class="my-4"/>
                      <span id="nice-pais">País</span>
                      <select class="form-select" id="select-pais">
                        <option value="0"><span id="nice-pais">País...</span></option>
                      </select>
                    </div>
                    <div>
                      <hr class="my-4"/>
                      <span id="nice-universidad">Universidad</span>
                      <select class="form-select" id="select-universidad">
                        <option value="0"><span id="nice-universidad">Universidad...</span></option>
                      </select>
                    </div>

                    <div>
                      <hr class="my-4"/>
                      <span id="nice-precio">Precio</span>
                      <div class="row">
                        <div class="col-6 d-flex">
                          <label for="formFile" class="price-input-lable">$</label>
                          <input type="number" class="price-input" id="min-price" value="2000" min="2000" max="200000">
                        </div>
                        <div class="col-6 d-flex">
                          <label for="formFile" class="price-input-lable">$</label>
                          <input type="number" class="price-input" id="max-price" value="200000" min="2000" max="200000">
                        </div>
                      </div>

                      <!--
                      <div class="middle mt-3 mr-3">
                        
                        
                        <div class="multi-range-slider">
                          <input type="range" id="input-left" min="2000" max="200000" value="2000">
                          <input type="range" id="input-right" min="2000" max="200000" value="200000">

                          <div class="slider-c">
                            <div class="track"></div>
                            <div class="range"></div>
                            <div class="thumb left">
                              <label class="float-left" id="label-min-price">$2000</label>
                            </div>
                            <div class="thumb right">
                              <label class="float-right" id="label-max-price">$200000</label>
                            </div>
                          </div>
                        </div>
                      </div>
                      -->
                      <input type="hidden" id="input-pagination_number" value="1"/>
                      <input type="hidden" id="pais" value="'.$pais.'"/>
                      <input type="hidden" id="disciplina_id" value="'.$disciplina_id.'"/>
                    </div> 
                </div>
              </div>
            </div>
            
            <div class="col-12 col-sm-9" id="contentProgramas">
              <div class="d-flex justify-content-center">
                <div class="spinner-border" style="width: 3rem; height: 3rem;" role="status"></div>
              </div>
            </div>
            <div class="col-12 col-sm-9 d-flex justify-content-center mt-3">
              <div class="btn-group" role="group">
                <button type="button" class="btn btn-primary " disabled id="prev"> < </button>
                <button type="button" class="btn btn-primary "> <span id="current-pagination">1</span> de <span id="total-paginations"></span> </button>
                <button type="button" class="btn btn-primary" id="next"> > </button>
              </div>
            </div>
        </div>
    ';
    return $content;
}
add_shortcode('super_search_pais', 'content_por_pais');

function content(){
    devtzal_enqueue_script();
    wp_register_script('my_main', plugins_url('/assets/main.js?time='.rand(),__FILE__ ), [], '', true);
    wp_enqueue_script('my_main');
    $content='';
    $types = get_post_types( [], 'objects' );
    $content.='
        <div class="row justify-content-end margin-initial">
          <div class="col-12 col-sm-9">
            <div class="row justify-content-end">
              <div class="col-12 col-sm-6 position-relative">
                
                <div id="nice-que-estudias" class="text-center_"><b>¿Qué deseas estudiar?</b></div>
                <input type="text" class="price-input" id="search-by-disciplina" placeholder="Administración de Empresas...">
                
                <div class="spinner-border spinner-border-sm" id="loader-disciplinas-text" role="status"></div>
              </div>
              <div class="col-12 col-sm-6">
                <div id="nice-donde-estudias" class="text-center_"><b>¿Dónde deseas estudiar?</b></div>
                <input type="text" class="price-input" id="search-by-location" placeholder="Irlanda...">
              </div>
            </div>
          </div>
        </div>
        <div class="row justify-content-end">
            <div class="col-12 col-sm-3">
              <div class="row">
                <button type="button" id="nice-busqueda" class="btn btn-outline-primary text-left mb-3 col-12 toggle-filters">
                  Búsqueda
                  <img src="'.plugins_url('/assets/arrow-down-sign-to-navigate.png',__FILE__).'" width="1em" class="d-sm-none"/>
                </button>
              </div>
              <div class="row" id="filters-container">
                <div class="position-fixed_ col-12">
                    <button type="button" id="deleted-filters" class="btn btn-primary">Eliminar Filtros</button>
                    <div>
                      <span id="nice-tipo-estudios">Tipo de estudios</span>
                      <select class="form-select" id="select-tipo-studios">
                        <option value="0"><span id="nice-tipo-estudios">Tipo de estudios...</span></option>
                      </select>
                    </div>
                    
                    <div>
                      <hr class="my-4"/>
                      <span id="nice-tipo-disciplinas">Disciplinas</span>
                      <div class="spinner-border spinner-border-sm" id="loader-disciplinas" role="status"></div>
                      <select class="form-select" id="select-disciplinas" style="display:none;">
                        <option value="0" ><span id="nice-disciplinas">Disciplinas...</span></option>
                      </select>
                    </div>
                    
                    <div  id="container-subdisciplina">
                      <hr class="my-4 hr" style="display:none;"/>
                      <span id="nice-tipo-subdisciplina"></span>
                      <div class="spinner-border spinner-border-sm" id="loader-subdisciplina" role="status" style="display:none;"></div>
                      <select class="form-select" id="select-subdisciplina" style="display:none;">
                        <option ><span id="nice-subdisciplina"></span></option>
                      </select>
                    </div>

                    <div>
                      <hr class="my-4"/>
                      <span id="nice-pais">País</span>
                      <select class="form-select" id="select-pais">
                        <option value="0"><span id="nice-pais">País...</span></option>
                      </select>
                    </div>

                    <div>
                      <hr class="my-4"/>
                      <span id="nice-universidad">Universidad</span>
                      <select class="form-select" id="select-universidad">
                        <option value="0"><span id="nice-universidad">Universidad...</span></option>
                      </select>
                    </div>

                    <div>
                      <hr class="my-4"/>
                      <span id="nice-precio">Precio</span>
                      <div class="row">
                        <div class="col-6 d-flex">
                          <label for="formFile" class="price-input-lable">$</label>
                          <input type="number" class="price-input" id="min-price" value="2000" min="2000" max="200000">
                        </div>
                        <div class="col-6 d-flex">
                          <label for="formFile" class="price-input-lable">$</label>
                          <input type="number" class="price-input" id="max-price" value="200000" min="2000" max="200000">
                        </div>
                      </div>

                      <!--
                      <div class="middle mt-3 mr-3">
                        
                        
                        <div class="multi-range-slider">
                          <input type="range" id="input-left" min="2000" max="200000" value="2000">
                          <input type="range" id="input-right" min="2000" max="200000" value="200000">

                          <div class="slider-c">
                            <div class="track"></div>
                            <div class="range"></div>
                            <div class="thumb left">
                              <label class="float-left" id="label-min-price">$2000</label>
                            </div>
                            <div class="thumb right">
                              <label class="float-right" id="label-max-price">$200000</label>
                            </div>
                          </div>
                        </div>
                      </div>
                      -->
                      <input type="hidden" id="input-pagination_number" value="1"/>
                    </div> 
                </div>
              </div>
            </div>
            
            <div class="col-12 col-sm-9" id="contentProgramas">
              <div class="d-flex justify-content-center">
                <div class="spinner-border" style="width: 3rem; height: 3rem;" role="status"></div>
              </div>
            </div>
            <div class="col-12 col-sm-9 d-flex justify-content-center mt-3">
              <div class="btn-group" role="group">
                <button type="button" class="btn btn-primary " disabled id="prev"> < </button>
                <button type="button" class="btn btn-primary "> <span id="current-pagination">1</span> de <span id="total-paginations"></span> </button>
                <button type="button" class="btn btn-primary" id="next"> > </button>
              </div>
            </div>
        </div>
    ';
    return $content;
}
add_shortcode('super_search', 'content');


function getPostTypes(){
    $types = get_post_types( [], 'objects' );
    $response=[];
    foreach ( $types as $type ) {
        if($type->public){
            array_push($response, $type);
        }
    }
    return $response;
}
add_action( 'rest_api_init', function () {
    register_rest_route( 'devtzal/v1', '/post_types', array(
      'methods' => 'GET',
      'callback' => 'getPostTypes',
      'args' => [],
    ) );
  } );

function getProgramas( WP_REST_Request $request ){
    $body = $request->get_json_params();
    
    $posts_per_page = $body["posts_per_page"];
    $pagination_number = $body["pagination_number"];
    $disciplina = $body["disciplina"];// category
    $subdisciplina = $body["subdisciplina"];//sub category
    $pais = $body["pais"]; //meta data
    $universidad = $body["universidad"]; //meta data
    $minPrice = $body["minPrice"]; //meta data
    $maxPrice = $body["maxPrice"]; //meta data
    $tipoEstudio = $body["tipoEstudio"]; //meta data

    $fromText = $body["fromText"]; //meta data

    $args = [
      'post_type' => 'programas',
      'orderby'   => 'menu_order',
      'order' => 'DESC',
      'posts_per_page'=>$posts_per_page,
      'offset'=> ($pagination_number - 1) * $posts_per_page,
      'tax_query'=>[],
      'meta_query'=>[],
    ];
    
    if( $disciplina ){
      // if ($disciplina == "247"){
      //   $disciplina=[$disciplina, "119"];
      // }
      array_push($args['tax_query'],[
        'taxonomy'         => 'programas-categories',
        'terms'            => $disciplina,
      ]);
    }
    if($subdisciplina){
      array_push($args['tax_query'],[
        'taxonomy'         => 'programas-categories',
        'terms'            => $subdisciplina,
      ]);
    }

    if( $minPrice && $maxPrice ){
      array_push($args['meta_query'],[
        [
          'key' => 'precio__pxid_fjnxizeqqcolvjx_0',
          'value' => [$minPrice, $maxPrice],
          'compare' => 'BETWEEN',
          'type'  => 'numeric'
        ]
      ]);
    }
    if( $pais ){
      array_push($args['meta_query'],[
        'key' => 'locaci_n__pxid_vmhpboqdvmytbzn_0',
        'value' => $pais,
      ]);
    }
    if( $tipoEstudio ){
      $value=$tipoEstudio;
      if($tipoEstudio=='Licenciatura'){
        $value=['Licenciatura con Honores', $tipoEstudio];
      }
      array_push($args['meta_query'],[
        'key' => 'nivel__pxid_dodgcgpusgnbpny_2',
        'value' => $value,
      ]);
    }
    if($universidad){
      array_push($args['meta_query'],[
        'key' => 'campus__pxid_durqhfzxqpupgom_0',
        'value' => $universidad,
      ]);
    }

    if($fromText){

      $args2=[
        'post_type' => 'programas',
        'orderby'   => 'menu_order',
        'order' => 'DESC',
        'posts_per_page'=>$posts_per_page,
        'offset'=> ($pagination_number - 1) * $posts_per_page,
        'tax_query'=>[],
        'meta_query'=>[],
      ];

      if($disciplina){
        array_push($args2['tax_query'],[
              'taxonomy'  => 'programas-categories',
              'field' => 'name',
              'terms' => $disciplina,
        ]);
      }
      if($universidad && $pais ){
        array_push($args2['meta_query'],[
          'relation' => 'OR',
          ['key' => 'campus__pxid_durqhfzxqpupgom_0', 'value' => $universidad],
          ['key' => 'locaci_n__pxid_vmhpboqdvmytbzn_0', 'value' => $pais]
        ]);
      }
      
      $programas = new WP_Query( $args2 );

    }else{

      $programas = new WP_Query( $args );

    }
    

    $response=[
        "posts"=>[],
    ];

    foreach ( $programas->posts as $programa ) {
        if($programa->post_status=='publish'){
            $programa->duracion = get_field( 'duraci_n__pxid_ikccbauokuraaqn_1', $programa->ID );
            $programa->locacion=  get_field( 'locaci_n__pxid_vmhpboqdvmytbzn_0', $programa->ID );
            $programa->universidad = get_field( 'campus__pxid_durqhfzxqpupgom_0', $programa->ID );
            $programa->tipoStudio = get_field( 'nivel__pxid_dodgcgpusgnbpny_2', $programa->ID );
            $programa->moneda = get_field( 'moneda__pxid_dqfqzmqwmojmcon_0', $programa->ID );
            $programa->precio_nice = get_field( 'precio__pxid_fjnxizeqqcolvjx_0', $programa->ID ) != null ? number_format(intval( get_field( 'precio__pxid_fjnxizeqqcolvjx_0', $programa->ID ) ) ): 0;
            //$programa->precio_nice = money_format('%.2n', intval( get_field( 'precio__pxid_fjnxizeqqcolvjx_0', $programa->ID ) ) );
            $programa->image = get_the_post_thumbnail_url( $programa->ID );
            $programa->permalink = get_permalink( $programa->ID );
            $programa->aprioridad = get_field( '__pxid_gbjenfhyuqjvzbf_0', $programa->ID );
            array_push($response["posts"], $programa);
        }
        
    }
    if($fromText){
      $response['args2']=$args2;
    }else{
      $response['args']=$args;
    }
    
    $response["post_count"]=$programas->post_count;
    // $response["current_post"]=$programas->current_post;
    $response["found_posts"]=$programas->found_posts;
    $response["total_pagination"]= ceil($programas->found_posts/$posts_per_page);
    $response["total_posts"]=count($programas->posts);
    return $response;
    // return get_terms('programas-categories',[
    //     "parent"=>0
    // ]);
}

add_action( 'rest_api_init', function () {
    register_rest_route( 'devtzal/v1', '/programas/all', array(
      'methods' => 'POST',
      'callback' => 'getProgramas',
      'args' => [
        'posts_per_page' => [
            'validate_callback' => function($param, $request, $key) {
                return is_numeric( $param );
              }
            ],
        'offset' => [
            'validate_callback' => function($param, $request, $key) {
                return is_numeric( $param );
                }
            ],
      ],
    ) );
  } 
);

function getDisciplinas( WP_REST_Request $request ){
    $all = $request->get_param( 'all' );
    if(!$all){
      $terms = get_terms(
        'programas-categories',
        [
          "parent"=>0,
          "hide_empty"  =>  true
        ]
      );
    }else{
      $terms = get_terms(
        'programas-categories',
        [ "hide_empty"  =>  true ]
      );
    }
    $response=[];
    
    foreach($terms as $term){
      array_push($response, $term);
    }
    return $response;
}
add_action( 'rest_api_init', function () {
    register_rest_route( 'devtzal/v1', '/disciplinas', array(
      'methods' => 'GET',
      'callback' => 'getDisciplinas',
      'args' => [
        'post_id' => [
            'validate_callback' => function($param, $request, $key) {
                return is_numeric( $param );
              }
            ],
      ],
    ) );
  } 
);

function getSubdisciplinas( WP_REST_Request $request ){
    $response = [];
    $terms = get_terms(
      'programas-categories',
      [
        "parent"=>$request->get_param( 'id' ),
        "hide_empty"  =>  true
      ]
    );
    foreach($terms as $term){
        array_push( $response, $term) ;
    }
    
    return $response;
}


add_action( 'rest_api_init', function () {
  register_rest_route( 'devtzal/v1', '/programas/search', array(
    'methods' => 'POST',
    'callback' => 'getDisciplinasbyQuery',
    'args' => [
      'posts_per_page' => [
          'validate_callback' => function($param, $request, $key) {
              return is_numeric( $param );
            }
          ],
      'offset' => [
          'validate_callback' => function($param, $request, $key) {
              return is_numeric( $param );
              }
          ],
    ],
  ) );
} 
);

function getDisciplinasbyQuery(WP_REST_Request $request){

    //$query = $request->get_param( 'query' );
    $body = $request->get_json_params();
    $query = $body["query"];
    $posts_per_page = $body["posts_per_page"];
    $pagination_number = $body["pagination_number"];
    //$response = [];
    //$termsId = get_term_children($request->get_param( 'query' ),'programas-categories');
    //foreach($termsId as $termnId){
      //array_push( $response, get_term($termnId) );
    //}


    $args = [
      'post_type' => 'programas',
      'orderby'   => 'post_title',
      'order' => 'ASC',
      'posts_per_page'=>$posts_per_page,
      'offset'=> ($pagination_number - 1) * $posts_per_page,
      'tax_query'=>[],
      //   'relation' => 'AND',
      // ],
      'meta_query'=>[]
    ];
    
    if( $query ){
      array_push($args['tax_query'],[
        'taxonomy'         => 'programas-categories',
        'terms'            => $query,
      ]);
    }
    $programas = new WP_Query( $args );


   $response=[
        "posts"=>[],
    ];

    foreach ( $programas->posts as $programa ) {
        if($programa->post_status=='publish'){
            $programa->duracion = get_field( 'duraci_n__pxid_ikccbauokuraaqn_1', $programa->ID );
            $programa->locacion=  get_field( 'locaci_n__pxid_vmhpboqdvmytbzn_0', $programa->ID );
            $programa->universidad = get_field( 'campus__pxid_durqhfzxqpupgom_0', $programa->ID );
            $programa->tipoStudio = get_field( 'nivel__pxid_dodgcgpusgnbpny_2', $programa->ID );
            $programa->precio = get_field( 'precio__pxid_fjnxizeqqcolvjx_0', $programa->ID );
            $programa->image = get_the_post_thumbnail_url( $programa->ID );
            $programa->permalink = get_permalink( $programa->ID );
            array_push($response["posts"], $programa);
        }
        
    }
    
  $response['args']=$args;
    
    $response["post_count"]=$programas->post_count;
    // $response["current_post"]=$programas->current_post;
    $response["found_posts"]=$programas->found_posts;
    $response["total_pagination"]= ceil($programas->found_posts/$posts_per_page);
    $response["total_posts"]=count($programas->posts);
    return $response;

}
add_action( 'rest_api_init', function () {
    register_rest_route( 'devtzal/v1', '/subdisciplinas', array(
      'methods' => 'GET',
      'callback' => 'getSubdisciplinas',
      'args' => [
        'id' => [
            'validate_callback' => function($param, $request, $key) {
                return is_numeric( $param );
              }
            ],
      ],
    ) );
  } 
);

function getMetaData( WP_REST_Request $request ){
    $post_id = $request->get_param( 'post_id' );
    $response=[];
    
    $response['duracion'] = get_field( 'duraci_n__pxid_ikccbauokuraaqn_1', $post_id );
    $response['locacion'] =  get_field( 'locaci_n__pxid_vmhpboqdvmytbzn_0', $post_id );
    $response['universidad'] = get_field( 'campus__pxid_durqhfzxqpupgom_0', $post_id );
    $response['tipoStudio'] = get_field( 'nivel__pxid_dodgcgpusgnbpny_2', $post_id );
    $response['precio'] = get_field( 'precio__pxid_fjnxizeqqcolvjx_0', $post_id );
    
    return $response;
}
add_action( 'rest_api_init', function () {
    register_rest_route( 'devtzal/v1', '/meta_data', array(
      'methods' => 'GET',
      'callback' => 'getMetaData',
      'args' => [
        'post_id' => [
            'validate_callback' => function($param, $request, $key) {
                return is_numeric( $param );
              }
            ],
      ],
    ) );
  } 
);


function devtzal_enqueue_script() {   
    $plugin_url = plugin_dir_url( __FILE__ );
    
    wp_enqueue_style( 'bootstrap',  $plugin_url . "/assets/bootstrap.min.css");
    wp_enqueue_style( 'style',  $plugin_url . "/assets/style.css?time=".rand());

    wp_register_script('typehead', plugins_url('/assets/typeahead.bundle.min.js',__FILE__ ), [], '', true);
    wp_enqueue_script('typehead');
    wp_register_script('bloodhound', plugins_url('/assets/bloodhound.min.js',__FILE__ ), [], '', true);
    wp_enqueue_script('bloodhound');
}
// add_action('wp_enqueue_scripts', 'devtzal_enqueue_script');