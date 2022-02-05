import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
})
export class SearchComponent implements OnInit {
  public isSearch: boolean = false;
  public searchFormGroup: FormGroup;

  constructor(
    private activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    private router: Router
  ) {
    this.searchFormGroup = this.formBuilder.group({
      search: [''],
    });

    this.activatedRoute.paramMap.subscribe((route: any) => {
      if(route?.params?.query) {
        this.isSearch = true;
        this.searchFormGroup.patchValue({
          search: route?.params?.query
        });
      }
    });
  }

  ngOnInit(): void {}

  search(): void {
    const query = this.searchFormGroup.value.search;

    if (!query) {
      return;
    }

    this.router.navigate([`/buscar/posts/${query}`]);
  }
}
