/**
 * A React component to view a PDF document
 *
 * @see https://react-pdf-viewer.dev
 * @license https://react-pdf-viewer.dev/license
 * @copyright 2019-2020 Nguyen Huu Phuoc <me@phuoc.ng>
 */

import React from 'react';

import PdfJs from '../PdfJs';
import Spinner from '../Spinner';

interface PageThumbnailProps {
    page: PdfJs.Page;
    pageHeight: number;
    pageWidth: number;
    rotation: number;
    thumbnailHeight: number;
    thumbnailWidth: number;
    onLoad(): void;
}

const PageThumbnail: React.FC<PageThumbnailProps> = ({
    page, pageHeight, pageWidth, rotation, thumbnailHeight, thumbnailWidth, onLoad,
}) => {
    const renderTask = React.useRef<PdfJs.PageRenderTask>();
    const [src, setSrc] = React.useState('');

    React.useEffect(() => {
        const task = renderTask.current;
        if (task) {
            task.cancel();
        }

        const canvas = document.createElement('canvas') as HTMLCanvasElement;
        const printUnit = 150 / 72;
        canvas.height = Math.floor(pageHeight * printUnit);
        canvas.width = Math.floor(pageWidth * printUnit);

        const canvasContext = canvas.getContext('2d') as CanvasRenderingContext2D;
        canvasContext.save();
        canvasContext.fillStyle = 'rgb(255, 255, 255)';
        canvasContext.fillRect(0, 0, canvas.width, canvas.height);
        canvasContext.restore();

        const viewport = page.getViewport({ rotation, scale: 1 });
        renderTask.current = page.render({
            canvasContext,
            intent: 'print',
            transform: [printUnit, 0, 0, printUnit, 0, 0],
            viewport,
        });
        renderTask.current.promise.then(
            (_) => {
                canvas.toBlob((blob) => {
                    setSrc(URL.createObjectURL(blob));
                });
                // setSrc(canvas.toDataURL());
            },
            (_) => {/**/},
        );
    }, []);

    return (
        !src
            ? <Spinner />
            : (
                <img
                    src={src}
                    style={{
                        height: `${Math.floor(pageHeight * 96 / 72)}px`,
                        width: `${Math.floor(pageWidth * 96 / 72)}px`,
                    }}
                    onLoad={onLoad}
                />
            )
    );
};

export default PageThumbnail;
