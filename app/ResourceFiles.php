<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class ResourceFiles extends Model
{
    protected $table = 'resource_files';

    protected $fillable = ['name', 'path', 'type', 'size', 'is_public'];

    public function getMimeType(){
        return mime_content_type($this->path);
    }

    public function getSize(){
        return filesize($this->path);
    }

    public function getUrl(){
        return url('/files/'.$this->name);
    }

    // delete file when deleting resource file
    public function delete(){
        unlink($this->path);
        parent::delete();
    }
}
