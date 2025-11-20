import { calculateMetrics, getAgeGroup, calculateAge } from './metricsCalculator';

describe('Metrics Calculator', () => {
  describe('calculateAge', () => {
    it('should correctly calculate age from birth date', () => {
      const birthDate = '2000-01-01';
      // Mock the current date to be 2023-01-01 for testing
      const mockDate = new Date('2023-01-01');
      const originalDateNow = global.Date.now;
      global.Date.now = jest.fn(() => mockDate.getTime());

      const age = calculateAge(birthDate);
      expect(age).toBe(25); // Age from 2000 to 2025

      // Restore the original Date.now
      global.Date.now = originalDateNow;
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
      expect(metrics).toHaveProperty('injuryRate');
      expect(metrics).toHaveProperty('caseFatalityRate');
      expect(metrics).toHaveProperty('accidentPerVehicle');
      expect(metrics).toHaveProperty('totalEncounters');
      expect(metrics).toHaveProperty('totalTrafficAccidents');
      expect(metrics).toHaveProperty('totalFatalities');
    });

    it('should correctly calculate rates with different population sizes for multipliers', async () => {
      // Mock data for testing with 1 death and 1 non-fatal injury
      const encounters = [
        {
          id: 'encounter-1',
          subject: { reference: 'Patient/patient-1' },
          hospitalization: { dischargeDisposition: { coding: [{ code: 'exp' }] } }
        },
        {
          id: 'encounter-2',
          subject: { reference: 'Patient/patient-2' },
          // Non-fatal encounter
        }
      ];

      const conditions = [
        {
          id: 'condition-1',
          subject: { reference: 'Patient/patient-1' },
          code: { coding: [{ code: '84757009', display: 'TraffIc accIdent leg FrActure', system: 'http://snomed.info/sct' }] } // Traffic-related
        },
        {
          id: 'condition-2',
          subject: { reference: 'Patient/patient-2' },
          code: { coding: [{ code: '84757009', display: 'motor vehicle accident injury', system: 'http://snomed.info/sct' }] } // Traffic-related
        }
      ];

      const patients = new Map([
        ['patient-1', { id: 'patient-1', gender: 'male', birthDate: '1990-01-01' }],
        ['patient-2', { id: 'patient-2', gender: 'female', birthDate: '1990-01-01' }]
      ]);

      // Test with different population sizes to verify rate calculation
      const basePopulation = 100000;  // 100k
      const smallerPopulation = 10000;  // 10k - this should make rates 10x higher

      const metricsBase = await calculateMetrics(encounters, conditions, patients, basePopulation);
      const metricsSmaller = await calculateMetrics(encounters, conditions, patients, smallerPopulation);

      // Mortality rate should be (deaths / population) * 100000
      // With 1 death and 100k population, rate should be (1/100000)*100000 = 1.0 per 100k
      // With 1 death and 10k population, rate should be (1/10000)*100000 = 10.0 per 100k
      expect(metricsBase.mortalityRate).toBeCloseTo(1.0, 10);  // 1.0 per 100k
      expect(metricsSmaller.mortalityRate).toBeCloseTo(10.0, 10);  // 10.0 per 100k

      // Injury rate should be (injuries / population) * 100000
      // With 1 non-fatal injury and 100k population, rate should be (1/100000)*100000 = 1.0 per 100k
      // With 1 non-fatal injury and 10k population, rate should be (1/10000)*100000 = 10.0 per 100k
      expect(metricsBase.injuryRate).toBeCloseTo(1.0, 10);  // 1.0 per 100k
      expect(metricsSmaller.injuryRate).toBeCloseTo(10.0, 10);  // 10.0 per 100k
    });
  });
});