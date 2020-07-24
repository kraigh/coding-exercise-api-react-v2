<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class GroupResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array
     */
     public function toArray($request)
 {
     return [
         'id'            => $this->id,
         'group_name'    => $this->group_name,
         'created_at'    => $this->created_at,
         'updated_at'    => $this->updated_at,
     ];
 }
}
