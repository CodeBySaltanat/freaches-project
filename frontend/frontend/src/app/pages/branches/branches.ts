import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api';

@Component({
  selector: 'app-branches',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './branches.html',
  styleUrl: './branches.css'
})
export class BranchesComponent implements OnInit {
  branches: any[] = [];

  constructor(
    private api: ApiService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.api.getBranches().subscribe((data: any) => {
      this.branches = data;
    });
  }

  openBranch(branch: any) {
    this.router.navigate(['/menu', branch.id]);
  }
}