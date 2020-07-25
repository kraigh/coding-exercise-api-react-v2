<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PersonGroupJoin extends Model
{
    protected $fillable = [
        'person_id',
        'group_id'
    ];
    protected $table = 'person_group_joins';
}
