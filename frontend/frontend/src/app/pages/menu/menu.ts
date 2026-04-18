import { Component, OnInit } from '@angular/core'; 
import { CommonModule } from '@angular/common'; 
import { CartService } from '../../services/cart'; 
import { Router } from '@angular/router';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule], 
  templateUrl: './menu.html',
  styleUrl: './menu.css'
})
export class MenuComponent implements OnInit {
  isLoggedIn = false;

  categories = [
    {
      name: '🥪 Sandwiches',
      items: [
        { id: 1, name: 'Chicken Sandwich', price: 1500, img: 'https://i.ytimg.com/vi/dRh1Q-jfJ04/maxresdefault.jpg' },
        { id: 2, name: 'Beef Sandwich', price: 1800, img: 'https://www.napoleon.com/sites/default/files/images/2024-02/RecipeBlog-serve3RoastBeefSandwich-01mar24.png' }
      ]
    },
    {
      name: '🥗 Bowls',
      items: [
        { id: 3, name: 'Chicken Bowl', price: 2000, img: 'https://cdn.lifehacker.ru/wp-content/uploads/2024/12/shutterstock_1894600639_1_1735206257-e1735206318385.jpg' },
        { id: 4, name: 'Salmon Bowl', price: 2500, img: 'https://i.pinimg.com/474x/50/4d/82/504d82a75ec330bd1fcc4d2bdb430bcd.jpg?nii=t' }
      ]
    },
    {
      name: '☕ Drinks',
      items: [
        { id: 5, name: 'Ice Coffee', price: 1200, img: 'https://i.ytimg.com/vi/mcJdTdwAs9I/hqdefault.jpg' },
        { id: 6, name: 'Coca-Cola', price: 900, img: 'https://avatars.mds.yandex.net/get-mpic/17854139/k_plus_ji4tBRosJUtcmcrpO51X/orig' }
      ]
    }
  ];

  constructor(
    private cartService: CartService,
    private router: Router 
  ) {}

  ngOnInit() {
    const token = localStorage.getItem('token');
    this.isLoggedIn = !!token; 
  } 

  addToCart(item: any) {
    const token = localStorage.getItem('token');
    
    if (!token) {
      alert('Сначала нужно войти в систему! 🥪');
      this.router.navigate(['/login']);
      return; 
    }

    this.cartService.addItem(item); 
    console.log("Товар добавлен:", item);
    console.log("Сейчас в корзине:", this.cartService.getItems());
    alert(item.name + ' добавлен в корзину! 🛒');
  }

  logout() {
    localStorage.removeItem('token'); // Сжигаем мосты (удаляем ключ)
    this.isLoggedIn = false;          // Прячем меню
    alert('Вы вышли из системы. Ждем вас снова! 🐾');
    this.router.navigate(['/login']); // Отправляем на вход
  }
}