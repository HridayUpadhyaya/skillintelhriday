Review
        {(modal?.type === 'curriculum' || modal?.type === 'course-analysis') && (
          <div className="modal-list">
            <div className="modal-section">
              <strong>Alignment Score</strong>
              <span>{modal.alignment ?? 'N/A'}%</span>
            </div>
            <div className="modal-section">
              <strong>Aligned Skills</strong>
              <span>{modal.alignedSkills?.length || 0}</span>
            </div>
            <div className="modal-section">
              <strong>Missing Skills</strong>
              <span className={modal.missingSkills?.length ? 'negative-text' : ''}>
                {modal.missingSkills?.length || 0}
              </span>
            </div>
            {modal.missingSkills?.length > 0 && (
              <>
                <p style={{ marginTop: '16px' }}>
                  <strong>Skills to add to curriculum:</strong>
                </p>
                {modal.missingSkills.map((s, i) => (
                  <div className="missing-skill" key={i}>
                    {s}
                  </div>
                ))}
              </>
            )}
            {!modal.missingSkills?.length && (
              <div className="no-gap" style={{ marginTop: '16px' }}>
                Fully Aligned — no curriculum changes needed.
              </div>
            )}
          </div>
        )}
        {modal?.type === 'skills' && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {modal.skills?.map((skill, idx) => (
              <span className="employer-skill" key={idx}>
                {skill}
              </span>
            ))}
          </div>
        )}
      </Modal>
    </div>
  )
}
export default App
