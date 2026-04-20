from django.db import migrations


def backfill_buyer_order_numbers(apps, schema_editor):
    Order = apps.get_model('api', 'Order')

    user_ids = (
        Order.objects
        .exclude(user_id__isnull=True)
        .values_list('user_id', flat=True)
        .distinct()
    )

    for user_id in user_ids:
        orders = Order.objects.filter(user_id=user_id).order_by('created_at', 'id')
        counter = 1
        for order in orders:
            if not order.buyer_order_number:
                order.buyer_order_number = counter
                order.save(update_fields=['buyer_order_number'])
            counter += 1


def reverse_backfill_buyer_order_numbers(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0009_order_buyer_order_number_alter_category_name_and_more'),
    ]

    operations = [
        migrations.RunPython(backfill_buyer_order_numbers, reverse_backfill_buyer_order_numbers),
    ]