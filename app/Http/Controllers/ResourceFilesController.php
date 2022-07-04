<?php

namespace App\Http\Controllers;

use App\ResourceFiles;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ResourceFilesController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        return view('interface/resources/index');
    }

    public function getAllFiles()
    {
        $files = ResourceFiles::all();
        return response()->json($files);
    }
    public function getPublicFiles()
    {
        $files = ResourceFiles::where('is_public', 1)->get();
        return response()->json($files);
    }

    public function getPrivateFiles()
    {
        $files = ResourceFiles::where('is_public', 0)->get();
        return response()->json($files);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $banned_files = ['exe','sh','bat','php','go','js','py','rb','pl','sh','c','cpp','java','cs','html','css','json','xml','sql','dmg',null,'bin','jar','ts','cpp'];
        
        $file = $request->file('file');
        $is_public = $request->input('isPublic');
        $name = $file->getClientOriginalName();
        // dd([
        //     'requests' => $request->all(),
        // ]);
        $extension = $file->getClientOriginalExtension();
        if(in_array($extension, $banned_files)){
            return response()->json([ 'status' => 'error', 'message' => 'File type not allowed', 'data' => ResourceFiles::all() ]);
            // return view('configs.files', ['status' => 'danger', 'message' => 'File type not allowed', 'data' => ResourceFiles::all()]);
        }

        $is_public = $is_public ?? false;
        $path = storage_path('files/' . $name);
        $file->move(storage_path('files'), $name);
        $file = new ResourceFiles();
        $file->name = $name;
        $file->path = $path;
        $file->type = mime_content_type($path); //$file->getMimeType();
        $file->size = filesize($path); //$file->getSize();
        $file->is_public = $is_public;
        $file->save();
        $files = ResourceFiles::all();
        return response()->json([ 'status' => 'success', 'message' => 'File uploaded', 'data' => $files ], 200);
        // return view('configs.files', ['status' => 'success', 'message' => 'File uploaded successfully', 'data' => $files]);
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        $file = ResourceFiles::find($id);
        // return view('configs.files', ['action' => 'show', 'data' => $file]);
        return response()->json($file);
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
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        $file = ResourceFiles::find($id);
        $file->delete();
        //delete file
        unlink($file->path);
        $files = ResourceFiles::all();
        return response()->json([ 'status' => 'success', 'message' => 'File deleted', 'data' => $files ], 200);
        // return redirect()->route('configuration.files')->with('status', 'success')->with('message', 'File deleted successfully')->with('data', $files);
    }

    public function download($id)
    {
        $file = ResourceFiles::find($id);
        return response()->download($file->path);
    }
}
