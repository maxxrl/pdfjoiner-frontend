import {Component} from '@angular/core';
import {NgxFileDropEntry} from "ngx-file-drop";
import {HttpClient} from "@angular/common/http";
import {v4 as uuidv4} from 'uuid';
import {BackendService} from "../services/backend.service";

@Component({
  selector: 'app-uploader',
  templateUrl: './uploader.component.html',
  styleUrls: ['./uploader.component.scss']
})

export class UploaderComponent {

  mergePDFs: MergePDF[] = [];
  http: HttpClient;
  currentMergeId = "";

  constructor(http: HttpClient, public backend: BackendService) {
    this.http = http;
  }


  public files: NgxFileDropEntry[] = [];

  public dropped(files: NgxFileDropEntry[]) {
    this.mergePDFs = [];
    this.files = files;
    for (const droppedFile of files) {

      // Is it a file?
      if (droppedFile.fileEntry.isFile) {
        const fileEntry = droppedFile.fileEntry as FileSystemFileEntry;
        fileEntry.file((file: File) => {
          let mergePDF = {
            mergeId: "0",
            fileName: droppedFile.relativePath,
            file: file
          }
          this.mergePDFs.push(mergePDF);
        });
      } else {
        // It was a directory (empty directories are added, otherwise only files)
        const fileEntry = droppedFile.fileEntry as FileSystemDirectoryEntry;
        console.log(droppedFile.relativePath, fileEntry);
      }

    }
  }

  public removeFile(item: NgxFileDropEntry) {
    const index = this.files.indexOf(item);
    this.files.splice(index, 1);
    const element = this.mergePDFs.find(value => value.fileName === item.relativePath);
    if (element){
      const elementIndex = this.mergePDFs.indexOf(element);
      this.mergePDFs.splice(elementIndex, 1);
    }

  }

  saveByteArray(bytes: any, type: any) {
    const blob = new Blob([bytes], {type: type});
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = "merged-by-maxxrl";
    console.log("before click");
    link.click();
  }

  clickUpload(): Promise<any> {
    const mergeId = uuidv4();
    console.log(mergeId);
    return new Promise<string>((resolve, reject) => {
      for (const mergePDF of this.mergePDFs) {

        this.backend.upload(mergeId, mergePDF).subscribe(value => {
          return resolve(mergeId);
        }, error => {
          return reject();
        })
      }
    });
  }


  clickMerge(): void {
    console.log(this.mergePDFs.length);
    this.clickUpload().then(mergeId => {
      this.backend.merge(mergeId).subscribe(data => {
        this.saveByteArray(data, "application/pdf");
      })
    })


  }
}

export interface MergePDF {
  mergeId: string,
  fileName: string,
  file: File
}
