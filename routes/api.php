<?php

use Illuminate\Http\Request;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::resource('people', 'PeopleController');
Route::resource('groups', 'GroupController');
Route::post('people/{id}/group', 'PeopleController@add_group');
Route::post('people/search', 'PeopleController@search');
Route::get('groups/search/{group_name}', 'GroupController@search');
Route::get('groups/{id}/people', 'GroupController@people');

