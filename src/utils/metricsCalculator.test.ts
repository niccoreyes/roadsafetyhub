import { calculateMetrics, getAgeGroup, calculateAge } from './metricsCalculator';

describe('Metrics Calculator', () => {
  describe('calculateAge', () => {
    it('should correctly calculate age from birth date', () => {
      // Use a fixed reference date for testing
      const birthDate = '2000-01-01';
      const referenceDate = new Date('2023-01-01');
      
      // Mock the Date constructor to return our reference date
      const originalDate = global.Date;
      global.Date = class extends originalDate {
        constructor() {
          super();
          return new originalDate(referenceDate);
        }
      } as any;

      const age = calculateAge(birthDate);
      expect(age).toBe(23);

      // Restore the original Date constructor
      global.Date = originalDate;
    });
  });

  describe('getAgeGroup', () => {
    it('should correctly map ages to age groups', () => {
      expect(getAgeGroup(3)).toBe('0-4');
      expect(getAgeGroup(5)).toBe('5-14');
      expect(getAgeGroup(14)).toBe('5-14');
      expect(getAgeGroup(15)).toBe('15-24');
      expect(getAgeGroup(24)).toBe('15-24');
      expect(getAgeGroup(25)).toBe('25-34');
      expect(getAgeGroup(34)).toBe('25-34');
      expect(getAgeGroup(35)).toBe('35-44');
      expect(getAgeGroup(44)).toBe('35-44');
      expect(getAgeGroup(45)).toBe('45-54');
      expect(getAgeGroup(54)).toBe('45-54');
      expect(getAgeGroup(55)).toBe('55-64');
      expect(getAgeGroup(64)).toBe('55-64');
      expect(getAgeGroup(65)).toBe('65-74');
      expect(getAgeGroup(74)).toBe('65-74');
      expect(getAgeGroup(75)).toBe('75+');
      expect(getAgeGroup(85)).toBe('75+');
    });
  });

  describe('calculateMetrics', () => {
    it('should calculate metrics correctly', async () => {
      // Mock data for testing
      const encounters = [
        {
          id: 'encounter-1',
          subject: { reference: 'Patient/patient-1' },
          hospitalization: { dischargeDisposition: { coding: [{ code: 'exp' }] } }
        }
      ];

      const conditions = [
        {
          id: 'condition-1',
          subject: { reference: 'Patient/patient-1' },
          code: { coding: [{ code: '84757009', display: 'Fracture of leg', system: 'http://snomed.info/sct' }] }
        }
      ];

      const patients = new Map([
        ['patient-1', { id: 'patient-1', gender: 'male', birthDate: '1990-01-01' }]
      ]);

      const metrics = await calculateMetrics(encounters, conditions, patients);

      // Check that metrics object has the expected properties
      expect(metrics).toHaveProperty('mortalityRate');
      expect(metrics).toHaveProperty('deathsPer10kVehicles');
      expect(metrics).toHaveProperty('injuryRate');
      expect(metrics).toHaveProperty('caseFatalityRate');
      expect(metrics).toHaveProperty('accidentPerVehicle');
      expect(metrics).toHaveProperty('totalEncounters');
      expect(metrics).toHaveProperty('totalTrafficAccidents');
      expect(metrics).toHaveProperty('totalFatalities');
    });
  });
});