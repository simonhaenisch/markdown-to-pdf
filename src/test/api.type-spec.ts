import { expectType } from 'tsd';
import { mdToPdf } from '..';
import { HtmlOutput, PdfOutput } from '../lib/generate-output';

(async () => {
	expectType<PdfOutput>(await mdToPdf({ content: 'foo' }));
	expectType<PdfOutput>(await mdToPdf({ path: 'foo.md' }));
	expectType<PdfOutput[]>(await mdToPdf({ paths: ['foo.md'] }));
	expectType<PdfOutput>(await mdToPdf({ path: 'foo.md' }, { as_html: false }));

	expectType<HtmlOutput>(await mdToPdf({ content: 'foo' }, { as_html: true }));
	expectType<HtmlOutput>(await mdToPdf({ path: 'foo.md' }, { as_html: true }));
	expectType<HtmlOutput[]>(await mdToPdf({ paths: ['foo.md'] }, { as_html: true }));

	expectType<string | undefined>((await mdToPdf({ content: 'foo' })).filename);

	expectType<Buffer>((await mdToPdf({ content: 'foo' })).content);
	expectType<string>((await mdToPdf({ content: 'foo' }, { as_html: true })).content);
})();
