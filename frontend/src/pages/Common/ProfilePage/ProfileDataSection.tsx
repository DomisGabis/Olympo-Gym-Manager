import type React from 'react'
import styles from './ProfileDataSection.module.css'

interface Props {
    title: string
    children?: React.ReactNode
    onEdit?: (newValue: string) => void
}

function ProfileDataSection({ title, children, onEdit }: Props) {

    const handleClick = () => {
        if (onEdit) {
            onEdit(children?.toString() || '');
        }
    }

    return (
        <div className={styles.section + (onEdit ? ' ' + styles.editable : '')} onClick={handleClick}>
            <h2 className={styles.title}>{title}</h2>
            <div className={styles.content}>
                {children}
            </div>
        </div>
    )
}

export default ProfileDataSection