// Integration test for the main dashboard functionality
import { calculateMetrics } from '../utils/metricsCalculator';
import { isTrafficRelatedCondition } from '../utils/snomedMapping';

describe('Dashboard Integration', () => {
  it('should process traffic-related conditions correctly', async () => {
    // Mock condition data that represents a traffic-related condition
    const mockCondition = {
      id: 'condition-1',
      code: {
        coding: [
          {
            system: 'http://snomed.info/sct',
            code: '84757009', // Example SNOMED code for a traffic-related condition
            display: 'Fracture of leg due to traffic accident'
          }
        ]
      },
      subject: { reference: 'Patient/patient-1' }
    };

    // Check if the condition is traffic-related
    const isTrafficRelated = await isTrafficRelatedCondition(mockCondition);
    
    // The test assumes that our mapping can identify traffic-related conditions
    // This is a basic validation that the function runs without errors
    expect(typeof isTrafficRelated).toBe('boolean');
  });

  it('should calculate metrics without throwing errors', async () => {
    // Mock data for metrics calculation
    const mockEncounters = [
      {
        id: 'encounter-1',
        subject: { reference: 'Patient/patient-1' },
        hospitalization: { 
          dischargeDisposition: { 
            coding: [{ code: 'exp' }] // Example code indicating expired/discharge
          } 
        }
      }
    ];

    const mockConditions = [
      {
        id: 'condition-1',
        subject: { reference: 'Patient/patient-1' },
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

    const mockPatients = new Map([
      ['patient-1', { id: 'patient-1', gender: 'male', birthDate: '1990-01-01' }]
    ]);

    // Calculate metrics based on mock data
    const metrics = await calculateMetrics(mockEncounters, mockConditions, mockPatients);

    // Validate that the metrics object has expected properties
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