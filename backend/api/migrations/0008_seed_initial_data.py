from django.db import migrations


def seed_initial_data(apps, schema_editor):
    Branch = apps.get_model('api', 'Branch')
    Category = apps.get_model('api', 'Category')
    Product = apps.get_model('api', 'Product')
    ProductImage = apps.get_model('api', 'ProductImage')

    tb0, _ = Branch.objects.get_or_create(
        name='TB0',
        defaults={'address': 'Tole bi 0 floor'}
    )

    pf1, _ = Branch.objects.get_or_create(
        name='PF1',
        defaults={'address': 'Panfilov 1 floor'}
    )

    sandwiches, _ = Category.objects.get_or_create(name='Sandwiches')
    drinks, _ = Category.objects.get_or_create(name='Drinks')

    chicken, _ = Product.objects.get_or_create(
        name='Chicken Sandwich',
        branch=tb0,
        defaults={
            'price': 1500,
            'description': 'Сэндвич с курицей',
            'category': sandwiches,
        }
    )

    beef, _ = Product.objects.get_or_create(
        name='Beef Sandwich',
        branch=tb0,
        defaults={
            'price': 1800,
            'description': 'Сэндвич с говядиной',
            'category': sandwiches,
        }
    )

    coffee, _ = Product.objects.get_or_create(
        name='Ice Coffee',
        branch=pf1,
        defaults={
            'price': 1200,
            'description': 'Холодный кофе',
            'category': drinks,
        }
    )

    cola, _ = Product.objects.get_or_create(
        name='Cola',
        branch=pf1,
        defaults={
            'price': 900,
            'description': 'Освежающий напиток',
            'category': drinks,
        }
    )

    images_map = {
        chicken: [
            'https://picsum.photos/seed/chicken1/800/600',
            'https://picsum.photos/seed/chicken2/800/600',
            'https://picsum.photos/seed/chicken3/800/600',
        ],
        beef: [
            'https://picsum.photos/seed/beef1/800/600',
            'https://picsum.photos/seed/beef2/800/600',
            'https://picsum.photos/seed/beef3/800/600',
        ],
        coffee: [
            'https://picsum.photos/seed/coffee1/800/600',
            'https://picsum.photos/seed/coffee2/800/600',
            'https://picsum.photos/seed/coffee3/800/600',
        ],
        cola: [
            'https://picsum.photos/seed/cola1/800/600',
            'https://picsum.photos/seed/cola2/800/600',
            'https://picsum.photos/seed/cola3/800/600',
        ],
    }

    for product, image_urls in images_map.items():
        for index, url in enumerate(image_urls):
            ProductImage.objects.get_or_create(
                product=product,
                image_url=url,
                defaults={'sort_order': index}
            )


def unseed_initial_data(apps, schema_editor):
    Branch = apps.get_model('api', 'Branch')
    Category = apps.get_model('api', 'Category')
    Product = apps.get_model('api', 'Product')
    ProductImage = apps.get_model('api', 'ProductImage')

    ProductImage.objects.filter(
        image_url__in=[
            'https://picsum.photos/seed/chicken1/800/600',
            'https://picsum.photos/seed/chicken2/800/600',
            'https://picsum.photos/seed/chicken3/800/600',
            'https://picsum.photos/seed/beef1/800/600',
            'https://picsum.photos/seed/beef2/800/600',
            'https://picsum.photos/seed/beef3/800/600',
            'https://picsum.photos/seed/coffee1/800/600',
            'https://picsum.photos/seed/coffee2/800/600',
            'https://picsum.photos/seed/coffee3/800/600',
            'https://picsum.photos/seed/cola1/800/600',
            'https://picsum.photos/seed/cola2/800/600',
            'https://picsum.photos/seed/cola3/800/600',
        ]
    ).delete()

    Product.objects.filter(name__in=[
        'Chicken Sandwich',
        'Beef Sandwich',
        'Ice Coffee',
        'Cola',
    ]).delete()

    Category.objects.filter(name__in=['Sandwiches', 'Drinks']).delete()
    Branch.objects.filter(name__in=['TB0', 'PF1']).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0007_productimage'),
    ]

    operations = [
        migrations.RunPython(seed_initial_data, unseed_initial_data),
    ]