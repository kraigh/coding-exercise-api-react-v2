<?php

/* @var $factory \Illuminate\Database\Eloquent\Factory */

use App\Models\Group;
use Faker\Generator as Faker;

$factory->define(Group::class, function (Faker $faker) {
    return [
        'group_name' => $faker->randomElement($array = array ('Elders','Volunteers','Staff','Members','Visitors'))
    ];
    
});
