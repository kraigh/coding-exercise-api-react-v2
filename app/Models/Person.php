<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Person extends Model
{
    protected $fillable = [
        'first_name',
        'last_name',
        'email_address',
        'status'
    ];

    /**
     * The groups that belong to the person.
     */
    public function groups()
    {
        return $this->belongsToMany('App\Models\Group', 'person_group_joins', 'person_id', 'group_id');
    }
}
