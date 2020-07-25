<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Group extends Model
{
    protected $fillable = [
        'group_name'
    ];

    /**
     * The people that belong to the group.
     */
    public function people()
    {
        return $this->belongsToMany('App\Models\Person', 'person_group_joins', 'group_id', 'person_id');
    }
}
