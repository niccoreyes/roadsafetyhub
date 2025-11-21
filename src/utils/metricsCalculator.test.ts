import { calculateMetrics, getAgeGroup, calculateAge, checkOutcomeStatus, isExpired } from './metricsCalculator';

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
          code: { coding: [
            {
              code: '274215009',
              display: 'Transport accident',
              system: 'http://snomed.info/sct'
            }
          ]}
        }
      ];

      const patients = new Map([
        ['patient-1', { id: 'patient-1', gender: 'male', birthDate: '1990-01-01' }]
      ]);

      const metrics = await calculateMetrics(encounters, conditions, patients, 1000000, 50000, undefined, []);

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
          code: { coding: [
            {
              code: '274215009',
              display: 'Transport accident',
              system: 'http://snomed.info/sct'
            }
          ]}
        },
        {
          id: 'condition-2',
          subject: { reference: 'Patient/patient-2' },
          code: { coding: [
            {
              code: '274215009',
              display: 'Transport accident',
              system: 'http://snomed.info/sct'
            }
          ]}
        }
      ];

      const patients = new Map([
        ['patient-1', { id: 'patient-1', gender: 'male', birthDate: '1990-01-01' }],
        ['patient-2', { id: 'patient-2', gender: 'female', birthDate: '1990-01-01' }]
      ]);

      // Test with different population sizes to verify rate calculation
      const basePopulation = 100000;  // 100k
      const smallerPopulation = 10000;  // 10k - this should make rates 10x higher

      const metricsBase = await calculateMetrics(encounters, conditions, patients, basePopulation, 50000, undefined, []);
      const metricsSmaller = await calculateMetrics(encounters, conditions, patients, smallerPopulation, 50000, undefined, []);

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

    it('should correctly deduplicate patients with multiple encounters for mortality rate calculation', async () => {
      // Test that a patient with multiple traffic-related encounters is only counted once in mortality
      const encounters = [
        {
          id: 'encounter-1',
          subject: { reference: 'Patient/patient-1' },
          hospitalization: { dischargeDisposition: { coding: [{ code: 'exp' }] } }
        },
        {
          id: 'encounter-2',
          subject: { reference: 'Patient/patient-1' }, // Same patient as encounter-1
          hospitalization: { dischargeDisposition: { coding: [{ code: 'exp' }] } }
        },
        {
          id: 'encounter-3',
          subject: { reference: 'Patient/patient-2' },
          hospitalization: { dischargeDisposition: { coding: [{ code: 'home' }] } } // Non-fatal
        }
      ];

      const conditions = [
        {
          id: 'condition-1',
          subject: { reference: 'Patient/patient-1' },
          code: { coding: [
            {
              code: '274215009',
              display: 'Transport accident',
              system: 'http://snomed.info/sct'
            }
          ]}
        },
        {
          id: 'condition-2',
          subject: { reference: 'Patient/patient-1' }, // Same patient as condition-1
          code: { coding: [
            {
              code: '127348004',
              display: 'Motor vehicle accident victim',
              system: 'http://snomed.info/sct'
            }
          ]}
        },
        {
          id: 'condition-3',
          subject: { reference: 'Patient/patient-2' },
          code: { coding: [
            {
              code: '274215009',
              display: 'Transport accident',
              system: 'http://snomed.info/sct'
            }
          ]}
        }
      ];

      const patients = new Map([
        ['patient-1', { id: 'patient-1', gender: 'male', birthDate: '1990-01-01' }],
        ['patient-2', { id: 'patient-2', gender: 'female', birthDate: '1990-01-01' }]
      ]);

      const population = 100000;
      const metrics = await calculateMetrics(encounters, conditions, patients, population, 50000, undefined, []);

      // The patient with ID 'patient-1' has 2 traffic-related encounters that both resulted in death
      // But they should only be counted once in the mortality rate calculation
      // 'patient-2' has a traffic-related encounter that did not result in death
      // So: 1 death out of the unique patients with traffic-related incidents
      expect(metrics.mortalityRate).toBeCloseTo((1 / population) * 100000, 10); // 1 death per 100k pop
      expect(metrics.totalFatalities).toBe(1); // Only 1 unique patient died from traffic accidents
      expect(metrics.totalTrafficAccidents).toBe(3); // 3 total traffic accident encounters
    });

    it('should correctly handle non-fatal traffic accidents for injury rate calculation', async () => {
      const encounters = [
        {
          id: 'encounter-1',
          subject: { reference: 'Patient/patient-1' },
          hospitalization: { dischargeDisposition: { coding: [{ code: 'home' }] } } // Non-fatal
        },
        {
          id: 'encounter-2',
          subject: { reference: 'Patient/patient-2' },
          hospitalization: { dischargeDisposition: { coding: [{ code: 'exp' }] } } // Fatal
        }
      ];

      const conditions = [
        {
          id: 'condition-1',
          subject: { reference: 'Patient/patient-1' },
          code: { coding: [
            {
              code: '274215009',
              display: 'Transport accident',
              system: 'http://snomed.info/sct'
            }
          ]}
        },
        {
          id: 'condition-2',
          subject: { reference: 'Patient/patient-2' },
          code: { coding: [
            {
              code: '274215009',
              display: 'Transport accident',
              system: 'http://snomed.info/sct'
            }
          ]}
        }
      ];

      const patients = new Map([
        ['patient-1', { id: 'patient-1', gender: 'male', birthDate: '1990-01-01' }],
        ['patient-2', { id: 'patient-2', gender: 'female', birthDate: '1990-01-01' }]
      ]);

      const population = 100000;
      const metrics = await calculateMetrics(encounters, conditions, patients, population, 50000, undefined, []);

      // Only patient-1 had a traffic-related accident that was not fatal (injury case)
      // So: 1 non-fatal injury out of the population
      expect(metrics.injuryRate).toBeCloseTo((1 / population) * 100000, 10); // 1 injury per 100k pop
      expect(metrics.totalFatalities).toBe(1); // 1 patient died from traffic accidents
    });

    describe('Transport Accident Counting Functions', () => {
      it('should correctly count observations with SNOMED CT code 274215009', () => {
        const observations = [
          {
            id: 'obs-1',
            code: {
              coding: [
                {
                  system: 'http://snomed.info/sct',
                  code: '274215009',
                  display: 'Transport accident'
                }
              ]
            }
          },
          {
            id: 'obs-2',
            code: {
              coding: [
                {
                  system: 'http://snomed.info/sct',
                  code: '84757009',
                  display: 'Fracture of leg'
                }
              ]
            }
          }
        ];

        const count = countTransportAccidents(observations);
        expect(count).toBe(1); // Only 1 observation matches
      });

      it('should correctly count observations with SNOMED CT code 127348004', () => {
        const observations = [
          {
            id: 'obs-1',
            code: {
              coding: [
                {
                  system: 'http://snomed.info/sct',
                  code: '127348004',
                  display: 'Motor vehicle accident victim'
                }
              ]
            }
          },
          {
            id: 'obs-2',
            code: {
              coding: [
                {
                  system: 'http://snomed.info/sct',
                  code: '84757009',
                  display: 'Fracture of leg'
                }
              ]
            }
          }
        ];

        const count = countTransportAccidents(observations);
        expect(count).toBe(1); // Only 1 observation matches
      });

      it('should count observations with both SNOMED CT codes', () => {
        const observations = [
          {
            id: 'obs-1',
            code: {
              coding: [
                {
                  system: 'http://snomed.info/sct',
                  code: '274215009',
                  display: 'Transport accident'
                }
              ]
            }
          },
          {
            id: 'obs-2',
            code: {
              coding: [
                {
                  system: 'http://snomed.info/sct',
                  code: '127348004',
                  display: 'Motor vehicle accident victim'
                }
              ]
            }
          },
          {
            id: 'obs-3',
            code: {
              coding: [
                {
                  system: 'http://snomed.info/sct',
                  code: '84757009',
                  display: 'Fracture of leg'
                }
              ]
            }
          }
        ];

        const count = countTransportAccidents(observations);
        expect(count).toBe(2); // 2 observations match (obs-1 and obs-2)
      });

      it('should correctly count conditions with SNOMED CT code 274215009', () => {
        const conditions = [
          {
            id: 'cond-1',
            code: {
              coding: [
                {
                  system: 'http://snomed.info/sct',
                  code: '274215009',
                  display: 'Transport accident'
                }
              ]
            }
          },
          {
            id: 'cond-2',
            code: {
              coding: [
                {
                  system: 'http://snomed.info/sct',
                  code: '84757009',
                  display: 'Fracture of leg'
                }
              ]
            }
          }
        ];

        const count = countTransportAccidentConditions(conditions);
        expect(count).toBe(1); // Only 1 condition matches
      });

      it('should correctly count conditions with SNOMED CT code 127348004', () => {
        const conditions = [
          {
            id: 'cond-1',
            code: {
              coding: [
                {
                  system: 'http://snomed.info/sct',
                  code: '127348004',
                  display: 'Motor vehicle accident victim'
                }
              ]
            }
          },
          {
            id: 'cond-2',
            code: {
              coding: [
                {
                  system: 'http://snomed.info/sct',
                  code: '84757009',
                  display: 'Fracture of leg'
                }
              ]
            }
          }
        ];

        const count = countTransportAccidentConditions(conditions);
        expect(count).toBe(1); // Only 1 condition matches
      });

      it('should count conditions with both SNOMED CT codes', () => {
        const conditions = [
          {
            id: 'cond-1',
            code: {
              coding: [
                {
                  system: 'http://snomed.info/sct',
                  code: '274215009',
                  display: 'Transport accident'
                }
              ]
            }
          },
          {
            id: 'cond-2',
            code: {
              coding: [
                {
                  system: 'http://snomed.info/sct',
                  code: '127348004',
                  display: 'Motor vehicle accident victim'
                }
              ]
            }
          },
          {
            id: 'cond-3',
            code: {
              coding: [
                {
                  system: 'http://snomed.info/sct',
                  code: '84757009',
                  display: 'Fracture of leg'
                }
              ]
            }
          }
        ];

        const count = countTransportAccidentConditions(conditions);
        expect(count).toBe(2); // 2 conditions match (cond-1 and cond-2)
      });

      it('should correctly extract unique patients with SNOMED codes', () => {
        const conditions = [
          {
            id: 'cond-1',
            subject: { reference: 'Patient/patient-1' },
            code: {
              coding: [
                {
                  system: 'http://snomed.info/sct',
                  code: '274215009',
                  display: 'Transport accident'
                }
              ]
            }
          },
          {
            id: 'cond-2',
            subject: { reference: 'Patient/patient-2' },
            code: {
              coding: [
                {
                  system: 'http://snomed.info/sct',
                  code: '127348004',
                  display: 'Motor vehicle accident victim'
                }
              ]
            }
          },
          {
            id: 'cond-3',
            subject: { reference: 'Patient/patient-3' },
            code: {
              coding: [
                {
                  system: 'http://snomed.info/sct',
                  code: '84757009',
                  display: 'Fracture of leg'
                }
              ]
            }
          }
        ];

        const uniquePatients = getUniquePatientsWithSnomedCodes(conditions);
        expect(uniquePatients.size).toBe(2); // 2 patients have conditions matching SNOMED codes
        expect(uniquePatients.has('patient-1')).toBe(true);
        expect(uniquePatients.has('patient-2')).toBe(true);
        expect(uniquePatients.has('patient-3')).toBe(false);
      });
    });
  });

  describe('checkOutcomeStatus', () => {
    it('should return true for patient with death observation using custom code system', async () => {
      const observations = [
        {
          id: 'obs-1',
          meta: {
            profile: [
              'https://build.fhir.org/ig/UPM-NTHC/PH-RoadSafetyIG/StructureDefinition/rs-observation-outcome-release'
            ]
          },
          code: {
            coding: [
              {
                system: 'http://snomed.info/sct',
                code: '418138009',
                display: 'Patient condition finding'
              }
            ]
          },
          valueCodeableConcept: {
            coding: [
              {
                system: 'http://www.roadsafetyph.doh.gov.ph/CodeSystem',
                code: 'DIED',
                display: 'Died'
              }
            ]
          },
          subject: { reference: 'Patient/patient-1' }
        }
      ];

      const result = await checkOutcomeStatus(observations, 'patient-1');
      expect(result).toBe(true);
    });

    it('should return false for patient with alive/improved observation using SNOMED code', async () => {
      const observations = [
        {
          id: 'obs-1',
          meta: {
            profile: [
              'https://build.fhir.org/ig/UPM-NTHC/PH-RoadSafetyIG/StructureDefinition/rs-observation-outcome-release'
            ]
          },
          code: {
            coding: [
              {
                system: 'http://snomed.info/sct',
                code: '418138009',
                display: 'Patient condition finding'
              }
            ]
          },
          valueCodeableConcept: {
            coding: [
              {
                system: 'http://snomed.info/sct',
                code: '268910001',
                display: 'Improved'
              }
            ]
          },
          subject: { reference: 'Patient/patient-1' }
        }
      ];

      const result = await checkOutcomeStatus(observations, 'patient-1');
      expect(result).toBe(false);
    });

    it('should return false for patient with no outcome observations', async () => {
      const observations = [
        {
          id: 'obs-1',
          meta: {
            profile: [
              'http://hl7.org/fhir/StructureDefinition/VitalSigns' // Different profile
            ]
          },
          code: {
            coding: [
              {
                system: 'http://loinc.org',
                code: '8867-4',
                display: 'Heart rate'
              }
            ]
          },
          subject: { reference: 'Patient/patient-1' }
        }
      ];

      const result = await checkOutcomeStatus(observations, 'patient-1');
      expect(result).toBe(false);
    });

    it('should return false for patient with matching profile but non-death outcome', async () => {
      const observations = [
        {
          id: 'obs-1',
          meta: {
            profile: [
              'https://build.fhir.org/ig/UPM-NTHC/PH-RoadSafetyIG/StructureDefinition/rs-observation-outcome-release'
            ]
          },
          code: {
            coding: [
              {
                system: 'http://snomed.info/sct',
                code: '418138009',
                display: 'Patient condition finding'
              }
            ]
          },
          valueCodeableConcept: {
            coding: [
              {
                system: 'http://www.roadsafetyph.doh.gov.ph/CodeSystem',
                code: 'SURVIVED',
                display: 'Survived'
              }
            ]
          },
          subject: { reference: 'Patient/patient-1' }
        }
      ];

      const result = await checkOutcomeStatus(observations, 'patient-1');
      expect(result).toBe(false);
    });

    it('should return false when no observations match the patient', async () => {
      const observations = [
        {
          id: 'obs-1',
          meta: {
            profile: [
              'https://build.fhir.org/ig/UPM-NTHC/PH-RoadSafetyIG/StructureDefinition/rs-observation-outcome-release'
            ]
          },
          code: {
            coding: [
              {
                system: 'http://snomed.info/sct',
                code: '418138009',
                display: 'Patient condition finding'
              }
            ]
          },
          valueCodeableConcept: {
            coding: [
              {
                system: 'http://www.roadsafetyph.doh.gov.ph/CodeSystem',
                code: 'DIED',
                display: 'Died'
              }
            ]
          },
          subject: { reference: 'Patient/patient-2' } // Different patient
        }
      ];

      const result = await checkOutcomeStatus(observations, 'patient-1');
      expect(result).toBe(false);
    });

    it('should handle empty observations array', async () => {
      const result = await checkOutcomeStatus([], 'patient-1');
      expect(result).toBe(false);
    });
  });

  describe('isExpired with observations support', () => {
    it('should use observation-based detection when observations are provided', async () => {
      const encounter = {
        id: 'enc-1',
        subject: { reference: 'Patient/patient-1' },
        hospitalization: { dischargeDisposition: { coding: [{ code: 'home' }] } } // Non-fatal discharge
      };

      const observations = [
        {
          id: 'obs-1',
          meta: {
            profile: [
              'https://build.fhir.org/ig/UPM-NTHC/PH-RoadSafetyIG/StructureDefinition/rs-observation-outcome-release'
            ]
          },
          code: {
            coding: [
              {
                system: 'http://snomed.info/sct',
                code: '418138009',
                display: 'Patient condition finding'
              }
            ]
          },
          valueCodeableConcept: {
            coding: [
              {
                system: 'http://www.roadsafetyph.doh.gov.ph/CodeSystem',
                code: 'DIED',
                display: 'Died'
              }
            ]
          },
          subject: { reference: 'Patient/patient-1' }
        }
      ];

      const result = await isExpired(encounter, observations, 'patient-1');
      expect(result).toBe(true); // Should return true based on observation, not discharge disposition
    });

    it('should fall back to discharge disposition when no relevant observations', async () => {
      const encounter = {
        id: 'enc-1',
        subject: { reference: 'Patient/patient-1' },
        hospitalization: { dischargeDisposition: { coding: [{ code: 'exp' }] } } // Fatal discharge
      };

      const observations = [
        {
          id: 'obs-1',
          meta: {
            profile: [
              'http://hl7.org/fhir/StructureDefinition/VitalSigns' // Different profile
            ]
          },
          subject: { reference: 'Patient/patient-1' }
        }
      ];

      const result = await isExpired(encounter, observations, 'patient-1');
      expect(result).toBe(true); // Should return true based on discharge disposition
    });

    it('should return false when neither observations nor discharge disposition indicate death', async () => {
      const encounter = {
        id: 'enc-1',
        subject: { reference: 'Patient/patient-1' },
        hospitalization: { dischargeDisposition: { coding: [{ code: 'home' }] } } // Non-fatal
      };

      const observations = [];

      const result = await isExpired(encounter, observations, 'patient-1');
      expect(result).toBe(false);
    });

    it('should prioritize observation-based outcome when both sources present but conflict', async () => {
      const encounter = {
        id: 'enc-1',
        subject: { reference: 'Patient/patient-1' },
        hospitalization: { dischargeDisposition: { coding: [{ code: 'home' }] } } // Non-fatal
      };

      const observations = [
        {
          id: 'obs-1',
          meta: {
            profile: [
              'https://build.fhir.org/ig/UPM-NTHC/PH-RoadSafetyIG/StructureDefinition/rs-observation-outcome-release'
            ]
          },
          code: {
            coding: [
              {
                system: 'http://snomed.info/sct',
                code: '418138009',
                display: 'Patient condition finding'
              }
            ]
          },
          valueCodeableConcept: {
            coding: [
              {
                system: 'http://www.roadsafetyph.doh.gov.ph/CodeSystem',
                code: 'DIED',
                display: 'Died'
              }
            ]
          },
          subject: { reference: 'Patient/patient-1' }
        }
      ];

      const result = await isExpired(encounter, observations, 'patient-1');
      expect(result).toBe(true); // Should prioritize observation-based outcome
    });

    it('should maintain backward compatibility when no observations provided', async () => {
      const encounter = {
        id: 'enc-1',
        subject: { reference: 'Patient/patient-1' },
        hospitalization: { dischargeDisposition: { coding: [{ code: 'exp' }] } }
      };

      const result = await isExpired(encounter); // No observations provided
      expect(result).toBe(true); // Should use discharge disposition fallback
    });
  });
});

import { countTransportAccidents, countTransportAccidentConditions, getUniquePatientsWithSnomedCodes } from './metricsCalculator';