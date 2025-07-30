import { SpecialItemService } from './src/services/SpecialItemService.js';

async function createCDResetItem() {
  try {
    const cdResetItemData = {
      name: 'إعادة تعيين أوقات الانتظار',
      description: 'يعيد تعيين جميع أوقات الانتظار (الجرائم، الجيم، السجن، المستشفى)',
      type: 'CD_RESET',
      effect: {
        health: 0,
        energy: 0,
        experience: 0,
        cdReset: true,
        duration: 0
      },
      price: 5000,
      currency: 'money',
      imageUrl: '',
      isAvailable: true,
      levelRequired: 5
    };

    console.log('Creating CD reset item...');
    const result = await SpecialItemService.createSpecialItem(cdResetItemData);
    
    console.log('CD reset item created successfully:');
    console.log('  ID:', result.id);
    console.log('  Name:', result.name);
    console.log('  Type:', result.type);
    console.log('  Effect:', JSON.stringify(result.effect, null, 2));
    console.log('  Price:', result.price);
    console.log('  Level Required:', result.levelRequired);
    
    console.log('\nYou can now use this item in the game to reset all cooldowns!');
    
  } catch (error) {
    console.error('Error creating CD reset item:', error);
  }
}

createCDResetItem(); 