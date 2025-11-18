import { fhirFetchAll, fetchValueSetExpansion, isCodingInValueSet } from './fhirClient';

// Mock fetch function
global.fetch = jest.fn();

describe('FHIR Client', () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockClear();
  });

  describe('fhirFetchAll', () => {
    it('should fetch all pages of a FHIR Bundle', async () => {
      // Mock the fetch response
      const mockBundle1 = {
        resourceType: "Bundle",
        type: "searchset",
        entry: [
          { resource: { id: "resource1", resourceType: "Patient" } },
          { resource: { id: "resource2", resourceType: "Patient" } }
        ],
        link: [
          { relation: "next", url: "https://example.com/next-page" }
        ]
      };

      const mockBundle2 = {
        resourceType: "Bundle",
        type: "searchset",
        entry: [
          { resource: { id: "resource3", resourceType: "Patient" } }
        ],
        link: [
          { relation: "next", url: null }
        ]
      };

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockBundle1
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockBundle2
        });

      const result = await fhirFetchAll('https://example.com/Patient');

      expect(result).toHaveLength(3);
      expect(result[0].id).toBe("resource1");
      expect(result[1].id).toBe("resource2");
      expect(result[2].id).toBe("resource3");
    });
  });

  describe('fetchValueSetExpansion', () => {
    it('should fetch ValueSet expansion from terminology server', async () => {
      const mockValueSet = {
        resourceType: "ValueSet",
        expansion: {
          contains: [
            { code: "test-code-1", display: "Test Code 1", system: "http://example.com" },
            { code: "test-code-2", display: "Test Code 2", system: "http://example.com" }
          ]
        }
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockValueSet
      });

      const result = await fetchValueSetExpansion('http://example.com/test-valueset');

      expect(result).toHaveLength(2);
      expect(result[0].code).toBe("test-code-1");
      expect(result[1].code).toBe("test-code-2");
    });
  });

  describe('isCodingInValueSet', () => {
    it('should check if a coding matches any code in a ValueSet', async () => {
      const mockValueSet = {
        resourceType: "ValueSet",
        expansion: {
          contains: [
            { code: "test-code-1", display: "Test Code 1", system: "http://example.com" },
            { code: "test-code-2", display: "Test Code 2", system: "http://example.com" }
          ]
        }
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockValueSet
      });

      const coding = { code: "test-code-1", system: "http://example.com" };
      const result = await isCodingInValueSet(coding, 'http://example.com/test-valueset');

      expect(result).toBe(true);
    });
  });
});