// <copyright file="PageEventHelper.cs" company="API">
//     Copyright (c) API. All rights reserved.
// </copyright>
// <summary>This is PageEventHelper class. Used when exporting html to pdf.</summary>

namespace AOHP.Core
{
    using System;
    using System.IO;
    using iTextSharp.text;
    using iTextSharp.text.pdf;

    /// <summary>
    /// PDF Event class for <c>pdf</c> write-event handling.
    /// </summary>
    public class PageEventHelper : PdfPageEventHelper
    {
        /// <summary>
        /// This is the <c>contentbyte</c> object of the writer.
        /// </summary>
        private PdfContentByte contentByte;

        /// <summary>
        /// Footer template.
        /// </summary>
        private PdfTemplate footerTemplate;

        /// <summary>
        /// Base font for footer/header.
        /// </summary>
        private BaseFont baseFont = null;

        /// <summary>
        /// Event - <c>Pdf</c> on open.
        /// </summary>
        /// <param name="writer"><c>The PdfWriter instance.</c></param>
        /// <param name="document">The Document instance.</param>
        public override void OnOpenDocument(PdfWriter writer, Document document)
        {
            this.baseFont = BaseFont.CreateFont(BaseFont.HELVETICA, BaseFont.CP1252, BaseFont.NOT_EMBEDDED);
            this.contentByte = writer.DirectContent;
            this.footerTemplate = this.contentByte.CreateTemplate(50, 100);
        }

        /// <summary>
        /// Event - <c>Pdf</c> on end.
        /// </summary>
        /// <param name="writer"><c>The PdfWriter instance.</c></param>
        /// <param name="document">The Document instance.</param>
        public override void OnEndPage(PdfWriter writer, Document document)
        {
            base.OnEndPage(writer, document);

            string text = "Page " + writer.PageNumber + " of ";

            // Add paging to footer
            this.contentByte.BeginText();
            this.contentByte.SetFontAndSize(this.baseFont, 12);
            this.contentByte.SetTextMatrix(document.PageSize.GetRight(120), document.PageSize.GetBottom(11));
            this.contentByte.ShowText(text);
            this.contentByte.EndText();
            float len = this.baseFont.GetWidthPoint(text, 12);
            this.contentByte.AddTemplate(this.footerTemplate, document.PageSize.GetRight(120) + len, document.PageSize.GetBottom(11));
        }

        /// <summary>
        /// Event - <c>Pdf</c> on close.
        /// </summary>
        /// <param name="writer"><c>The PdfWriter instance.</c></param>
        /// <param name="document">The Document instance.</param>
        public override void OnCloseDocument(PdfWriter writer, Document document)
        {
            base.OnCloseDocument(writer, document);
            this.footerTemplate.BeginText();
            this.footerTemplate.SetFontAndSize(this.baseFont, 12);
            this.footerTemplate.SetTextMatrix(0, 0);
            this.footerTemplate.ShowText((writer.PageNumber - 1).ToString());
            this.footerTemplate.EndText();
        }
    }
}
