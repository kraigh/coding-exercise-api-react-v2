<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

use App\Http\Resources\PeopleCollection;
use App\Http\Resources\PersonResource;
use App\Models\Person;
use App\Models\PersonGroupJoin;

class PeopleController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        return new PeopleCollection(Person::all());
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $request->validate([
            'first_name'    => 'required|max:255',
            'last_name'     => 'required|max:255',
            'email_address' => 'required|email',
            'status'        => Rule::in(['active', 'archived'])
        ]);

        $person = Person::create($request->all());

        return (new PersonResource($person))
            ->response()
            ->setStatusCode(201);
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        return new PersonResource(Person::findOrFail($id));
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function edit($id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        $person = Person::findOrFail($id);
        $person->update($request->all());

        return response()->json(null, 204);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        $person = Person::findOrFail($id);
        $person->delete();

        return response()->json(null, 204);
    }

    /**
     * Add a person to a group.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function add_group(Request $request, $id) {
        $person = Person::findOrFail($id);

        // prevent multiple groups being added to one person
        $existingJoin = PersonGroupJoin::firstWhere('person_id', $id);
        if ($existingJoin) {
            // error handle
            abort(500, 'Person already belongs to group.');
        } else {
            $personGroupJoin = PersonGroupJoin::create([
                'person_id' => $id,
                'group_id' => $request->group_id,
            ]);
            $personGroupJoin->save;

            return (new PersonResource($person))
                ->response()
                ->setStatusCode(201);
            }
    }
    /**
     * Search for a person
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function search(Request $request)
    {
        if ($request->email) {
            $person = Person::where('email', $request->email)->firstOrFail();
        } else if ($request->first_name && $request->last_name) {
            $person = Person::where('first_name', $request->first_name)->where('last_name', $request->last_name)->firstOrFail();
        } else {
            return response('Improper Search', 400);
        }
        return (new PersonResource($person))
            ->response()
            ->setStatusCode(201);
    }
}
