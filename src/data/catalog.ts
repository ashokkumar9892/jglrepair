import type { ApplianceType } from '../types'

/** Brands commonly serviced by independent Charlotte-area appliance shops. */
export const BRANDS = [
  'Amana',
  'Bosch',
  'Frigidaire',
  'GE',
  'KitchenAid',
  'Kenmore',
  'LG',
  'Maytag',
  'Samsung',
  'Sears',
  'Speed Queen',
  'Whirlpool',
  'Other',
]

export const APPLIANCE_META: Record<
  ApplianceType,
  { icon: string; blurb: string; problems: string[] }
> = {
  Refrigerator: {
    icon: '🧊',
    blurb: 'Fridge, freezer, ice maker',
    problems: ['Not cooling', 'Leaking', 'Making noise', 'Ice maker not working', 'Error code'],
  },
  Washer: {
    icon: '🌀',
    blurb: 'Top load & front load',
    problems: ['Not spinning', 'Leaking', 'Not draining', 'Making noise', 'Error code'],
  },
  Dryer: {
    icon: '🔥',
    blurb: 'Gas & electric',
    problems: ['Not heating', 'Not spinning', 'Making noise', 'Takes too long', 'Error code'],
  },
  Dishwasher: {
    icon: '🍽️',
    blurb: 'Built-in & portable',
    problems: ['Leaking', 'Not draining', 'Not cleaning dishes', 'Making noise', 'Error code'],
  },
  Oven: {
    icon: '🍞',
    blurb: 'Wall oven & built-in',
    problems: ['Not heating', 'Uneven baking', 'Door won\u2019t latch', 'Making noise', 'Error code'],
  },
  Range: {
    icon: '🍳',
    blurb: 'Stove, cooktop + oven',
    problems: ['Not heating', 'Burner won\u2019t ignite', 'Making noise', 'Sparking', 'Error code'],
  },
  'Garbage Disposal': {
    icon: '🚰',
    blurb: 'Under-sink disposal',
    problems: ['Humming but not running', 'Jammed', 'Leaking', 'Making noise', 'Will not turn on'],
  },
}

export const TIME_WINDOWS = [
  '8:00 AM - 10:00 AM',
  '10:00 AM - 12:00 PM',
  '12:00 PM - 2:00 PM',
  '2:00 PM - 4:00 PM',
  '4:00 PM - 6:00 PM',
]

export const COMMON_PARTS = [
  { name: 'Evaporator fan motor', partNumber: 'DA31-00146E', price: 195 },
  { name: 'Compressor start relay', partNumber: 'DA35-00126A', price: 78 },
  { name: 'Dryer heating element', partNumber: 'WP279838', price: 96 },
  { name: 'Washer drive belt', partNumber: 'W10006384', price: 42 },
  { name: 'Door latch assembly', partNumber: 'WD21X23458', price: 88 },
  { name: 'Drain pump', partNumber: 'W10348269', price: 124 },
  { name: 'Oven igniter', partNumber: 'WB13K21', price: 132 },
  { name: 'Water inlet valve', partNumber: 'WPW10420083', price: 69 },
  { name: 'Control board', partNumber: 'EBR86697502', price: 248 },
  { name: 'Garbage disposal unit (3/4 hp)', partNumber: 'BADGER-5XP', price: 159 },
]

export const DIAGNOSTIC_FEE = 85
