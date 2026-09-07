import os
import uuid
from flask import Blueprint, request, jsonify
from pdf_rag_service import rag_store, answer_pdf_question, UPLOADS_DIR

pdf_bp = Blueprint('pdf_bp', __name__)

def get_user_id(req):
    """Extract user_id from auth header or default to 'default_user' for guest mode."""
    if hasattr(req, 'current_user') and req.current_user and 'uid' in req.current_user:
        return req.current_user['uid']
    auth_header = req.headers.get('Authorization', '')
    if auth_header.startswith('Bearer '):
        token = auth_header.split(' ')[1]
        if token and token != 'null' and token != 'undefined':
            return token[:32]
    return 'default_user'

@pdf_bp.route('/api/pdf/upload', methods=['POST', 'OPTIONS'])
def upload_pdfs():
    if request.method == 'OPTIONS':
        return jsonify({'ok': True}), 200

    user_id = get_user_id(request)
    if 'files' not in request.files and 'file' not in request.files:
        return jsonify({'error': 'No PDF file provided in request'}), 400

    files = request.files.getlist('files')
    if not files and 'file' in request.files:
        files = [request.files['file']]

    user_upload_dir = os.path.join(UPLOADS_DIR, user_id)
    os.makedirs(user_upload_dir, exist_ok=True)

    file_tuples = []
    processed_files = []

    for f in files:
        if not f or not f.filename:
            continue
        if not f.filename.lower().endswith('.pdf'):
            return jsonify({'error': f'File {f.filename} is not a valid PDF file'}), 400

        pdf_id = str(uuid.uuid4())[:8]
        safe_filename = f.filename.replace(' ', '_')
        save_path = os.path.join(user_upload_dir, f"{pdf_id}_{safe_filename}")
        f.save(save_path)

        file_tuples.append((save_path, f.filename, pdf_id))
        processed_files.append({
            'pdf_id': pdf_id,
            'filename': f.filename
        })

    if not file_tuples:
        return jsonify({'error': 'No valid PDF files were uploaded'}), 400

    added = rag_store.process_and_add_pdfs(user_id, file_tuples)

    return jsonify({
        'message': f'Successfully uploaded and indexed {len(added)} PDF file(s)',
        'pdfs': added,
        'total_user_pdfs': len(rag_store.get_user_pdfs(user_id))
    }), 200

@pdf_bp.route('/api/pdf/list', methods=['GET', 'OPTIONS'])
def list_user_pdfs():
    if request.method == 'OPTIONS':
        return jsonify({'ok': True}), 200

    user_id = get_user_id(request)
    pdfs = rag_store.get_user_pdfs(user_id)
    return jsonify({'pdfs': pdfs}), 200

@pdf_bp.route('/api/pdf/<pdf_id>', methods=['DELETE', 'OPTIONS'])
def delete_pdf_route(pdf_id):
    if request.method == 'OPTIONS':
        return jsonify({'ok': True}), 200

    user_id = get_user_id(request)
    success = rag_store.delete_pdf(user_id, pdf_id)
    if success:
        return jsonify({
            'message': 'PDF deleted successfully',
            'remaining_pdfs': rag_store.get_user_pdfs(user_id)
        }), 200
    else:
        return jsonify({'error': 'PDF not found'}), 404

@pdf_bp.route('/api/pdf/query', methods=['POST', 'OPTIONS'])
def query_pdf():
    if request.method == 'OPTIONS':
        return jsonify({'ok': True}), 200

    data = request.get_json() or {}
    question = data.get('question', '').strip()

    if not question:
        return jsonify({'error': 'Question parameter is required'}), 400

    user_id = get_user_id(request)
    result = answer_pdf_question(user_id, question)

    return jsonify(result), 200

@pdf_bp.route('/api/pdf/clear', methods=['DELETE', 'OPTIONS'])
def clear_all_pdfs():
    if request.method == 'OPTIONS':
        return jsonify({'ok': True}), 200

    user_id = get_user_id(request)
    pdfs = rag_store.get_user_pdfs(user_id)
    for p in pdfs:
        rag_store.delete_pdf(user_id, p['pdf_id'])

    return jsonify({'message': 'All PDFs cleared'}), 200
