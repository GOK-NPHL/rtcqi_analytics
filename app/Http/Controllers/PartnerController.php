<?php

namespace App\Http\Controllers;

use App\OdkOrgunit;
use App\Partner;
use App\PartnerOrgUnits;
use App\PartnerUsers;
use App\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class PartnerController extends Controller
{
    //middleware auth
    public function __construct()
    {
        $this->middleware('auth');
    }
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        return view('interface/partners/index');
    }

    public function getAllPartners()
    {
        $partners = Partner::all();
        // parent name
        foreach ($partners as $partner) {
            if ($partner->parent_partner_id != null) {
                $parent = Partner::find($partner->parent_partner_id);
                if ($parent != null) {
                    $partner->parent_name = $parent->name;
                }
            } else {
                $partner->parent_name = null;
            }
        }
        return response()->json($partners);
    }

    public function getPartner(Request $request)
    {
        $partner = Partner::find($request->id);
        if ($partner) {
            // get users
            $partner->users = $partner->users()->get();
            // get org units
            $pous = PartnerOrgUnits::where('partner_id', $partner->id)->get();
            $partner_sites = [];
            $partner_ous = [];
            foreach ($pous as $partner_org_unit) {
                $ou = OdkOrgunit::where('org_unit_id', $partner_org_unit->org_unit_id)->first();
                if ($ou) {
                    $partner_ous[] = $ou;
                    // check ou level. If level is less than 4, loop through all children till you get level 4 children and add them to the partner_sites array
                    if ($ou->level < 4) {
                        $children = $ou->children()->get();
                        // $children = OdkOrgunit::where('parent_id', $ou->org_unit_id)->get();
                        foreach ($children as $child) {
                            if ($child->level == 4) {
                                array_push($partner_sites, $child);
                            }else {
                                $grand_children = $child->children()->get();
                                foreach ($grand_children as $grand_child) {
                                    if ($grand_child->level == 4) {
                                        array_push($partner_sites, $grand_child);
                                    } else {
                                        $great_grand_children = $grand_child->children()->get();
                                        foreach ($great_grand_children as $great_grand_child) {
                                            if ($great_grand_child->level == 4) {
                                                array_push($partner_sites, $great_grand_child);
                                            } else {
                                                $great_great_grand_children = $great_grand_child->children()->get();
                                                foreach ($great_great_grand_children as $great_great_grand_child) {
                                                    if ($great_great_grand_child->level == 4) {
                                                        array_push($partner_sites, $great_great_grand_child);
                                                    } else {
                                                        $great_great_great_grand_children = $great_great_grand_child->children()->get();
                                                        foreach ($great_great_great_grand_children as $great_great_great_grand_child) {
                                                            if ($great_great_great_grand_child->level == 4) {
                                                                array_push($partner_sites, $great_great_great_grand_child);
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    } else {
                        array_push($partner_sites, $ou);
                    }
                }
            }
            // $partner->org_units = $partner_org_units;
            $partner->org_units = $partner_ous;
            $partner->sites = $partner_sites;
            // parent
            if ($partner->parent_partner_id) {
                $parent_partner = Partner::find($partner->parent_partner_id);
                if ($parent_partner) {
                    $partner->parent = $parent_partner;
                }
            }
        }
        return response()->json($partner);
    }

    public function getPartnerUsers(Request $request)
    {
        $partner = Partner::find($request->id);
        $users = $partner->users()->get();
        return response()->json($users);
    }

    public function getPartnerOrgUnits(Request $request)
    {
        $partner = Partner::find($request->id);
        if ($partner) {
            $pous = PartnerOrgUnits::where('partner_id', $partner->id)->get();
            $partner_org_units = [];
            foreach ($pous as $partner_org_unit) {
                $ou = OdkOrgunit::where('org_unit_id', $partner_org_unit->org_unit_id)->first();
                if ($ou) {
                    $partner_org_units[] = $ou;
                }
            }
            return response()->json($partner_org_units);
        }
    }

    public function createPartner(Request $request)
    {
        try {
            // validate
            $validatedData = $request->validate([
                'name' => 'required|max:255',
                // 'description' => 'required|max:255',
                // 'url' => 'required|max:255',
                // 'location' => 'required|max:255',
                'active' => 'required|boolean',
                // 'start_date' => 'required|date',
                // 'end_date' => 'required|date',
                // 'email' => 'required|max:255',
                // 'phone' => 'required|max:255',
                // 'address' => 'required|max:255',
            ]);

            if ($validatedData) {
                $partner = new Partner;
                $partner->name = $request->name;
                $partner->description = $request->description;
                $partner->url = $request->url;
                $partner->location = $request->location;
                $partner->active = $request->active;
                $partner->start_date = $request->start_date;
                $partner->end_date = $request->end_date;
                $partner->email = $request->email;
                $partner->phone = $request->phone;
                $partner->address = $request->address;

                // if parent
                if ($request->parent_partner_id && $request->parent_partner_id != '') {
                    $parent = Partner::find($request->parent_partner_id);
                    if ($parent) {
                        $partner->parent_partner_id = $parent->id;
                    }
                } else {
                    $partner->parent_partner_id = null;
                }

                // org level
                if ($request->level && $request->level != '') {
                    $partner->level = $request->level;
                }

                $partner->save();
                // map users
                if ($request->users) {
                    try {
                        $partner_users = $request->users;
                        foreach ($partner_users as $usr) {
                            // check if user exists
                            $user = User::find($usr);
                            if ($user) {
                                // check if user is already mapped
                                $partner_user = PartnerUsers::where('partner_id', $partner->id)->where('user_id', $user->id)->first();
                                if (!$partner_user) {
                                    $partner_user = new PartnerUsers;
                                    $partner_user->partner_id = $partner->id;
                                    $partner_user->user_id = $user->id;
                                    $partner_user->save();
                                }
                            } else {
                                return response()->json(['error' => 'User not found: ' . $usr], 404);
                            }
                        }
                    } catch (\Exception $e) {
                        return response()->json(['error' => 'Error mapping users to partner: ' . $e->getMessage()], 500);
                    }
                }
                // map org units
                if ($request->org_units) {
                    try {
                        $partner_org_units = $request->org_units;
                        foreach ($partner_org_units as $ou) {
                            // check if org unit exists
                            $org_unit = OdkOrgunit::where('org_unit_id', $ou)->first();
                            if ($org_unit) {
                                // check if org unit is already mapped
                                $partner_org_unit = PartnerOrgUnits::where('partner_id', $partner->id)->where('org_unit_id', $org_unit->id)->first();
                                if (!$partner_org_unit) {
                                    $partner_org_unit = new PartnerOrgUnits;
                                    $partner_org_unit->partner_id = $partner->id;
                                    $partner_org_unit->org_unit_id = $org_unit->org_unit_id;
                                    $partner_org_unit->save();
                                }
                            } else {
                                return response()->json(['error' => 'Org unit not found: ' . $ou], 404);
                            }
                        }
                    } catch (\Exception $e) {
                        return response()->json(['error' => 'Error mapping org units to partner: ' . $e->getMessage()], 500);
                    }
                }
                return response()->json($partner);
            } else {
                return response()->json(['error' => 'Error creating partner: Validation failed.'], 500);
            }
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Error creating partner: ' . $e->getMessage()
            ], 500);
        }
    }

    public function mapPartnerUsers(Request $request)
    {
        try {
            // validate
            $validatedData = $request->validate([
                'partner_id' => 'required|integer',
                'user_id' => 'required|integer',
            ]);
            if ($validatedData) {
                $partner = Partner::find($request->partner_id);
                $user = User::find($request->user_id);
                if ($partner && $user) {
                    // check if user is already mapped
                    $partner_user = PartnerUsers::where('partner_id', $partner->id)->where('user_id', $user->id)->first();
                    if (!$partner_user) {
                        $partner_user = new PartnerUsers;
                        $partner_user->partner_id = $partner->id;
                        $partner_user->user_id = $user->id;
                        $partner_user->save();
                        return response()->json($partner_user);
                    } else {
                        return response()->json(['error' => 'User is already mapped to partner.'], 500);
                    }
                } else {
                    return response()->json(['error' => 'Error mapping user to partner: Partner or user not found.'], 500);
                }
            } else {
                return response()->json(['error' => 'Error mapping user to partner: Validation failed.'], 500);
            }
        } catch (\Exception $e) {
            return response()->json($e->getMessage());
        }
    }

    public function mapPartnerOrgUnits(Request $request)
    {
        try {
            // validate
            $validatedData = $request->validate([
                'partner_id' => 'required|integer',
                'org_unit_id' => 'required|integer',
            ]);
            if ($validatedData) {
                $partner = Partner::find($request->partner_id);
                $org_unit = OdkOrgunit::where('org_unit_id', $request->org_unit_id)->first();
                if ($partner && $org_unit) {
                    // check if org unit is already mapped
                    $partner_org_unit = PartnerOrgUnits::where('partner_id', $partner->id)->where('org_unit_id', $org_unit->id)->first();
                    if (!$partner_org_unit) {
                        $partner_org_unit = new PartnerOrgUnits;
                        $partner_org_unit->partner_id = $partner->id;
                        $partner_org_unit->org_unit_id = $org_unit->id;
                        $partner_org_unit->save();
                        return response()->json($partner_org_unit);
                    } else {
                        return response()->json(['error' => 'Org unit is already mapped to partner.'], 500);
                    }
                } else {
                    return response()->json(['error' => 'Error mapping org unit to partner: Partner or org unit not found.'], 500);
                }
            } else {
                return response()->json(['error' => 'Error mapping org unit to partner: Validation failed.'], 500);
            }
        } catch (\Exception $e) {
            return response()->json($e->getMessage());
        }
    }

    public function updatePartner(Request $request)
    {
        try {
            // validate
            $validatedData = $request->validate([
                'id' => 'required|integer',
                // 'name' => 'required|string',
                // 'start_date' => 'required|date',
                // 'end_date' => 'required|date',
                // 'email' => 'required|email',
                // 'phone' => 'required|string',
                // 'address' => 'required|string',
            ]);
            if ($validatedData) {
                $partner = Partner::find($request->id);
                if ($partner) {
                    $partner->name = $request->name;
                    $partner->start_date = $request->start_date;
                    $partner->end_date = $request->end_date;
                    $partner->email = $request->email;
                    $partner->phone = $request->phone;
                    $partner->address = $request->address;
                    // if parent
                    if ($request->parent_partner_id && $request->parent_partner_id != '') {
                        $parent = Partner::find($request->parent_partner_id);
                        if ($parent) {
                            $partner->parent_partner_id = $parent->id;
                        }
                    }
                    // org level
                    if ($request->level && $request->level != '') {
                        $partner->level = $request->level;
                    }
                    $partner->save();

                    // map org units
                    if ($request->org_units && $request->org_units != '') {
                        try {
                            $partner_org_units = $request->org_units;
                            // delete existing org unit mappings
                            $current_mappings = PartnerOrgUnits::where('partner_id', $partner->id)->get();
                            foreach ($current_mappings as $mapping) {
                                $mapping->delete();
                            }
                            foreach ($partner_org_units as $ou) {
                                // check if org unit exists
                                $org_unit = OdkOrgunit::where('org_unit_id', $ou)->first();
                                if ($org_unit) {
                                    // check if org unit is already mapped
                                    $partner_org_unit = PartnerOrgUnits::where('partner_id', $partner->id)->where('org_unit_id', $org_unit->id)->first();
                                    if (!$partner_org_unit) {
                                        $partner_org_unit = new PartnerOrgUnits;
                                        $partner_org_unit->partner_id = $partner->id;
                                        $partner_org_unit->org_unit_id = $org_unit->org_unit_id;
                                        $partner_org_unit->save();
                                    }
                                } else {
                                    return response()->json(['error' => 'Org unit not found: ' . $ou], 404);
                                }
                            }
                        } catch (\Exception $e) {
                            return response()->json(['error' => 'Error mapping org units to partner: ' . $e->getMessage()], 500);
                        }
                    }

                    // map users
                    if ($request->users && $request->users != '') {
                        try {
                            $partner_users = $request->users;
                            // delete existing user mappings
                            $current_mappings = PartnerUsers::where('partner_id', $partner->id)->get();
                            foreach ($current_mappings as $mapping) {
                                $mapping->delete();
                            }
                            foreach ($partner_users as $u) {
                                // check if user exists
                                $user = User::find($u);
                                if ($user) {
                                    // check if user is already mapped
                                    $partner_user = PartnerUsers::where('partner_id', $partner->id)->where('user_id', $user->id)->first();
                                    if (!$partner_user) {
                                        $partner_user = new PartnerUsers;
                                        $partner_user->partner_id = $partner->id;
                                        $partner_user->user_id = $user->id;
                                        $partner_user->save();
                                    }
                                } else {
                                    return response()->json(['error' => 'User not found: ' . $u], 404);
                                }
                            }
                        } catch (\Exception $e) {
                            return response()->json(['error' => 'Error mapping users to partner: ' . $e->getMessage()], 500);
                        }
                    }
                    return response()->json($partner);
                } else {
                    return response()->json(['error' => 'Error editing partner: Partner not found.'], 500);
                }
            } else {
                return response()->json(['error' => 'Error editing partner: Validation failed.'], 500);
            }
        } catch (\Exception $e) {
            return response()->json($e->getMessage());
        }
    }

    public function deletePartner(Request $request)
    {
        try {
            // validate
            $validatedData = $request->id;
            if ($validatedData) {
                $partner = Partner::find($request->id);
                if ($partner) {
                    // delete user mappings
                    $partner_users = PartnerUsers::where('partner_id', $partner->id)->get();
                    foreach ($partner_users as $partner_user) {
                        $partner_user->delete();
                    }
                    // delete org unit mappings
                    $partner_org_units = PartnerOrgUnits::where('partner_id', $partner->id)->get();
                    foreach ($partner_org_units as $partner_org_unit) {
                        $partner_org_unit->delete();
                    }
                    $partner->delete();
                    return response()->json($partner);
                } else {
                    return response()->json(['error' => 'Error deleting partner: Partner not found.'], 500);
                }
            } else {
                return response()->json(['error' => 'Error deleting partner: Validation failed.'], 500);
            }
        } catch (\Exception $e) {
            return response()->json($e->getMessage());
        }
    }
}
