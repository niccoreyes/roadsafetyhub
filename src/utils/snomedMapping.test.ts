import { isTrafficAccident, isTrafficRelatedCondition } from './snomedMapping';

describe('Snomed Mapping', () => {
  describe('isTrafficAccident', () => {
    it('should return true for SNOMED CT code 274215009 (Transport accident)', () => {
      const coding = {
        system: 'http://snomed.info/sct',
        code: '274215009',
        display: 'Transport accident'
      };
      
      expect(isTrafficAccident(coding)).toBe(true);
    });

    it('should return true for SNOMED CT code 127348004 (Motor vehicle accident victim)', () => {
      const coding = {
        system: 'http://snomed.info/sct',
        code: '127348004',
        display: 'Motor vehicle accident victim'
      };
      
      expect(isTrafficAccident(coding)).toBe(true);
    });

    it('should return false for non-SNOMED systems', () => {
      const coding = {
        system: 'http://hl7.org/fhir/sid/icd-10-cm',
        code: 'V892XXA',
        display: 'Motor vehicle accident'
      };
      
      expect(isTrafficAccident(coding)).toBe(false);
    });

    it('should return false for other SNOMED codes', () => {
      const coding = {
        system: 'http://snomed.info/sct',
        code: '123456',
        display: 'Some other condition'
      };
      
      expect(isTrafficAccident(coding)).toBe(false);
    });

    it('should return false for undefined coding', () => {
      expect(isTrafficAccident(undefined)).toBe(false);
    });

    it('should return false for SNOMED CT code with non-matching code', () => {
      const coding = {
        system: 'http://snomed.info/sct',
        code: '84757009', // Fracture of leg
        display: 'Fracture of leg'
      };
      
      expect(isTrafficAccident(coding)).toBe(false);
    });
  });

  describe('isTrafficRelatedCondition', () => {
    it('should return true for condition with SNOMED CT code 274215009', () => {
      const condition = {
        code: {
          coding: [
            {
              system: 'http://snomed.info/sct',
              code: '274215009',
              display: 'Transport accident'
            }
          ]
        }
      };
      
      expect(isTrafficRelatedCondition(condition)).toBe(true);
    });

    it('should return true for condition with SNOMED CT code 127348004', () => {
      const condition = {
        code: {
          coding: [
            {
              system: 'http://snomed.info/sct',
              code: '127348004',
              display: 'Motor vehicle accident victim'
            }
          ]
        }
      };
      
      expect(isTrafficRelatedCondition(condition)).toBe(true);
    });

    it('should return true if one of multiple codings matches', () => {
      const condition = {
        code: {
          coding: [
            {
              system: 'http://snomed.info/sct',
              code: '84757009', // Fracture of leg
              display: 'Fracture of leg'
            },
            {
              system: 'http://snomed.info/sct',
              code: '274215009', // Transport accident
              display: 'Transport accident'
            }
          ]
        }
      };
      
      expect(isTrafficRelatedCondition(condition)).toBe(true);
    });

    it('should return false for condition with no matching codes', () => {
      const condition = {
        code: {
          coding: [
            {
              system: 'http://snomed.info/sct',
              code: '84757009', // Fracture of leg
              display: 'Fracture of leg'
            }
          ]
        }
      };
      
      expect(isTrafficRelatedCondition(condition)).toBe(false);
    });

    it('should return false for condition with no coding', () => {
      const condition = {
        code: {}
      };
      
      expect(isTrafficRelatedCondition(condition)).toBe(false);
    });

    it('should return false for undefined condition', () => {
      expect(isTrafficRelatedCondition(undefined)).toBe(false);
    });
  });
});