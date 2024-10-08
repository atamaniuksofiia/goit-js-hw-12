import {createImageMarkup } from './js/render-functions';
import {fetchImages } from './js/pixabay-api';
import { BASE_URL, API_KEY } from './js/pixabay-api.js';
import axios from 'axios';
import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const form = document.querySelector('.search-form');
const gallery = document.querySelector('.gallery');
const loadMoreBtn = document.querySelector('.js-btn-load');
const loader = document.querySelector('.loader');

let query = '';
let page = 1;
let totalHits = 0;

const lightbox = new SimpleLightbox('.gallery a');

form.addEventListener('submit', async (event) => {
    event.preventDefault();
    query = document.querySelector('input[name="query"]').value.trim();

    if (!query) {
        iziToast.error({
            title: 'Error',
            message: 'Search query cannot be empty.',
        });
        return;
    }

    gallery.innerHTML = '';
    page = 1;

    loader.classList.remove('is-hidden');
    loadMoreBtn.style.display = 'none';
    
    try {
        const { images, totalHits: total } = await fetchImages(query, page);
        totalHits = total; 

        if (images.length === 0) {
            iziToast.error({
                title: 'Error',
                message: 'Sorry, there are no images matching your search query. Please try again!',
            });
            loadMoreBtn.style.display = 'none'; 
        } else {
            createImageMarkup(images);
            lightbox.refresh();
            if (totalHits > 15) {
                loadMoreBtn.style.display = 'block';
            }
        }
    } catch (error) {
        console.error(error);
        iziToast.error({
            title: 'Error',
            message: 'An error occurred while fetching images. Please try again later.',
        });
        loadMoreBtn.style.display = 'none'; 
    } finally {
        loader.classList.add('is-hidden');
    }
});


loadMoreBtn.addEventListener('click', async () => {
    page += 1;
    loader.classList.remove('is-hidden');
    loadMoreBtn.style.display = 'none'; 

    
    try {
        const { images, totalHits: total } = await fetchImages(query, page);
        
        if (images.length === 0) {
            iziToast.error({
                title: 'Error',
                message: 'Sorry, there are no images matching your search query. Please try again!',
            });
            loadMoreBtn.style.display = 'none';
            return;
         } 
            createImageMarkup(images);
            lightbox.refresh();

             if (images.length < 15 || page * 15 >= totalHits) {
                loadMoreBtn.style.display = 'none';  
            }  else {
                loadMoreBtn.style.display = 'block';
            }

        const galleryItemHeight = document.querySelector('.gallery-item')?.getBoundingClientRect().height || 0;
        window.scrollBy({
            top: galleryItemHeight * 2,
            behavior: 'smooth',
        });
    } catch (error) {
        iziToast.error({
            title: 'Error',
            message: 'An error occurred while fetching images. Please try again later.',
        });
        loadMoreBtn.style.display = 'none';
    } finally {
        loader.classList.add('is-hidden');
    }
});
