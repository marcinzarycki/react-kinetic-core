import axios from 'axios';

import { fetchSpace } from './space';
import { SpaceBuilder } from '../test_utils/space_builder';
import { rejectPromiseWith, resolvePromiseWith } from '../test_utils/promises';
import { fetchDocMarkdown } from '../test_utils/docs';

// Mock out the bundle object from a dependency.
jest.mock('../core-helpers', () => ({
  bundle: {
    apiLocation: () => 'space/app/api/v1',
  },
}));

describe('space api', () => {
  test('documentation', () => {
    const methods = [
      'fetchSpace',
    ];

    expect.assertions(methods.length);
    return fetchDocMarkdown('API.md').then((result) => {
      methods.forEach((method) => {
        const matches = result.filter(line => line.endsWith(method));
        expect(matches).toHaveLength(1);
      });
    });
  });
  describe('#fetchSpace', () => {
    describe('when successful', () => {
      let response;
      let testSpace;

      beforeEach(() => {
        response = {
          status: 200,
          data: {
            space: {},
          },
        };
        testSpace = new SpaceBuilder().stub().withAttribute('Attribute', 'value').build();
        response.data.space = testSpace;
        axios.get = resolvePromiseWith(response);
      });

      test('does not return errors', () => {
        expect.assertions(1);
        return fetchSpace().then(({ serverError }) => {
          expect(serverError).toBeUndefined();
        });
      });

      test('returns a space', () => {
        expect.assertions(1);
        return fetchSpace().then(({ space }) => {
          expect(space).toMatchObject({
            name: testSpace.name,
            slug: testSpace.slug,
          });
        });
      });

      test('translates attributes', () => {
        expect.assertions(2);
        return fetchSpace({ xlatAttributes: true }).then(({ space }) => {
          expect(space.attributes).toBeDefined();
          expect(space.attributes).not.toBeInstanceOf(Array);
        });
      });
    });

    describe('when unsuccessful', () => {
      let response;

      beforeEach(() => {
        response = {
          status: 500,
        };
        axios.get = rejectPromiseWith({ response });
      });

      test('does return errors', () => {
        expect.assertions(1);
        return fetchSpace({ includes: 'attributes', xlatAttributes: true }).then(({ serverError }) => {
          expect(serverError).toBeDefined();
        });
      });
    });
  });
});
