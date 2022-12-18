import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {MergePDF} from "../uploader/uploader.component";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class BackendService {
  httpClient: HttpClient;

  constructor(httpClient: HttpClient) {
    this.httpClient = httpClient
  }


  public merge(currentMergeId: string): Observable<any> {
    let headers = new HttpHeaders({
      'Content-Type': 'application/pdf',
      responseType: 'blob',
      Accept: 'application/pdf',
      observe: 'response'
    })
    return this.httpClient.get('/api/merge?mergeId=' + currentMergeId, {
      headers: headers, responseType: 'blob'
    });
  }

  public upload(mergeId: string, mergePDF: MergePDF): Observable<MergePDF> {
    const formData = new FormData()
    formData.append('pdf', mergePDF.file, mergePDF.fileName);
    formData.append('mergeId', mergeId);
    return this.httpClient.post<MergePDF>('/api/upload', formData);
  }
}
